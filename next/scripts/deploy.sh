#!/bin/bash

# CRM Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting CRM deployment to ${ENVIRONMENT}${NC}"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}❌ Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo -e "${RED}❌ AWS CDK is not installed. Installing...${NC}"
    npm install -g aws-cdk
fi

# Check if Node.js is the correct version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18"
if ! dpkg --compare-versions "$NODE_VERSION" "ge" "$REQUIRED_VERSION"; then
    echo -e "${RED}❌ Node.js version $REQUIRED_VERSION or higher is required${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Build and test the application
echo -e "${YELLOW}🔨 Building and testing the application...${NC}"
cd "$ROOT_DIR"

# Install dependencies
npm ci

# Run linting
echo -e "${YELLOW}🧹 Running linter...${NC}"
npm run lint

# Run TypeScript check
echo -e "${YELLOW}🔍 Running TypeScript check...${NC}"
npx tsc --noEmit

# Build the application
echo -e "${YELLOW}📦 Building application...${NC}"
npm run build

echo -e "${GREEN}✅ Application build completed${NC}"

# Deploy infrastructure
echo -e "${YELLOW}🏗️ Deploying infrastructure...${NC}"
cd "$ROOT_DIR/../infrastructure"

# Install CDK dependencies
npm ci

# Bootstrap CDK (if needed)
echo -e "${YELLOW}🔄 Bootstrapping CDK...${NC}"
cdk bootstrap --context environment="$ENVIRONMENT"

# Deploy infrastructure
echo -e "${YELLOW}🚀 Deploying infrastructure stack...${NC}"
cdk deploy --all --require-approval never --context environment="$ENVIRONMENT"

echo -e "${GREEN}✅ Infrastructure deployment completed${NC}"

# Run database migrations (if needed)
echo -e "${YELLOW}💾 Running database migrations...${NC}"
cd "$ROOT_DIR"

if [ -f "prisma/schema.prisma" ]; then
    # Get database credentials from AWS Secrets Manager
    SECRET_ARN=$(aws secretsmanager list-secrets --query "SecretList[?starts_with(Name, 'crm-db-$ENVIRONMENT')].ARN" --output text)
    
    if [ -n "$SECRET_ARN" ]; then
        echo -e "${YELLOW}🔐 Retrieving database credentials...${NC}"
        SECRET_VALUE=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ARN" --query SecretString --output text)
        
        DB_USER=$(echo "$SECRET_VALUE" | jq -r .username)
        DB_PASS=$(echo "$SECRET_VALUE" | jq -r .password)
        DB_HOST=$(aws ssm get-parameter --name "/crm/$ENVIRONMENT/database-endpoint" --query Parameter.Value --output text)
        
        export DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:5432/crmdb"
        
        echo -e "${YELLOW}🔄 Deploying database migrations...${NC}"
        npx prisma migrate deploy
        
        echo -e "${GREEN}✅ Database migrations completed${NC}"
    else
        echo -e "${YELLOW}⚠️ Database secret not found, skipping migrations${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ No Prisma schema found, skipping migrations${NC}"
fi

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"

# Get App Runner service URL
SERVICE_URL=$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='crm-app-$ENVIRONMENT'].ServiceUrl" --output text)

if [ -n "$SERVICE_URL" ]; then
    SERVICE_URL="https://$SERVICE_URL"
    
    # Wait for service to be ready
    echo -e "${YELLOW}⏳ Waiting for service to be ready...${NC}"
    sleep 30
    
    # Perform health check
    for i in {1..10}; do
        if curl -f "$SERVICE_URL/api/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Health check passed!${NC}"
            echo -e "${GREEN}🌐 Application is available at: $SERVICE_URL${NC}"
            break
        else
            echo -e "${YELLOW}⏳ Attempt $i failed, retrying in 30 seconds...${NC}"
            sleep 30
        fi
        
        if [ $i -eq 10 ]; then
            echo -e "${RED}❌ Health check failed after 10 attempts${NC}"
            echo -e "${YELLOW}💡 Check the logs: aws logs tail /aws/apprunner/crm-app-$ENVIRONMENT --follow${NC}"
            exit 1
        fi
    done
else
    echo -e "${RED}❌ Could not find App Runner service URL${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment to $ENVIRONMENT completed successfully!${NC}"
echo -e "${BLUE}📊 View the dashboard: https://console.aws.amazon.com/cloudwatch/home#dashboards:name=CRM-$ENVIRONMENT-Overview${NC}"
echo -e "${BLUE}📱 Application URL: $SERVICE_URL${NC}" 