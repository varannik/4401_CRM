#!/bin/bash

# Deployment script for Azure CRM infrastructure
# Usage: ./deploy.sh <environment>

set -e

# Check if environment is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <environment>"
    echo "Available environments: dev, staging, prod"
    exit 1
fi

ENVIRONMENT=$1
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$ROOT_DIR/terraform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting CRM deployment to ${ENVIRONMENT}${NC}"

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "prod" ]]; then
    echo -e "${RED}❌ Invalid environment. Use 'dev', 'staging', or 'prod'${NC}"
    exit 1
fi

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check if Azure CLI is installed and user is logged in
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed${NC}"
    exit 1
fi

if ! az account show &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Azure. Run 'az login'${NC}"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed${NC}"
    exit 1
fi

# Check if Docker is installed (for container builds)
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Check if environment file exists
ENV_FILE="$ROOT_DIR/environments/${ENVIRONMENT}.tfvars"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file not found: $ENV_FILE${NC}"
    echo "Run ./setup-azure.sh first to create environment files"
    exit 1
fi

# Check if backend configuration exists
BACKEND_CONFIG="$ROOT_DIR/../environments/backend-${ENVIRONMENT}.conf"
if [ ! -f "$BACKEND_CONFIG" ]; then
    echo -e "${RED}❌ Backend configuration not found: $BACKEND_CONFIG${NC}"
    echo "Backend configuration should be in infrastructure/environments/"
    exit 1
fi

# Build and push container image
echo -e "${YELLOW}🔨 Building and pushing container image...${NC}"
cd "$ROOT_DIR/../../next"

# Get container registry from Terraform output (if available)
ACR_NAME=""
ACR_SERVER=""
if [ -f "$TERRAFORM_DIR/.terraform/terraform.tfstate" ]; then
    # Get outputs and filter out warnings/errors to get clean values
    ACR_NAME_RAW=$(terraform -chdir="$TERRAFORM_DIR" output -raw container_registry_name 2>/dev/null || echo "")
    ACR_SERVER_RAW=$(terraform -chdir="$TERRAFORM_DIR" output -raw container_registry_server 2>/dev/null || echo "")
    
    # Only use output if it doesn't contain terraform warnings or errors
    if [[ "$ACR_NAME_RAW" =~ ^[a-zA-Z0-9]+$ ]]; then
        ACR_NAME="$ACR_NAME_RAW"
    fi
    
    if [[ "$ACR_SERVER_RAW" =~ ^[a-zA-Z0-9.-]+$ ]]; then
        ACR_SERVER="$ACR_SERVER_RAW"
    fi
fi

# If registry is not in state yet, create it now (targeted apply) so we can push image before full deploy
if [ -z "$ACR_NAME" ] || [ -z "$ACR_SERVER" ]; then
    echo -e "${YELLOW}⚠️ Container registry not found in state. Creating registry first...${NC}"
    terraform -chdir="$TERRAFORM_DIR" init -backend-config="$BACKEND_CONFIG" >/dev/null
    terraform -chdir="$TERRAFORM_DIR" plan -var-file="$ENV_FILE" -target=module.container_registry -out=acr.tfplan >/dev/null
    
    if terraform -chdir="$TERRAFORM_DIR" apply -auto-approve acr.tfplan; then
        echo -e "${GREEN}✅ Container registry created successfully${NC}"
        # Read outputs again with clean parsing
        ACR_NAME_RAW=$(terraform -chdir="$TERRAFORM_DIR" output -raw container_registry_name 2>/dev/null || echo "")
        ACR_SERVER_RAW=$(terraform -chdir="$TERRAFORM_DIR" output -raw container_registry_server 2>/dev/null || echo "")
        
        # Only use clean values
        if [[ "$ACR_NAME_RAW" =~ ^[a-zA-Z0-9]+$ ]]; then
            ACR_NAME="$ACR_NAME_RAW"
        fi
        
        if [[ "$ACR_SERVER_RAW" =~ ^[a-zA-Z0-9.-]+$ ]]; then
            ACR_SERVER="$ACR_SERVER_RAW"
        fi
    else
        echo -e "${YELLOW}⚠️ Terraform ACR creation failed. Trying to create ACR directly with Azure CLI...${NC}"
        
        # Get location from tfvars file more reliably
        LOCATION=$(grep -E '^location\s*=' "$ENV_FILE" | sed 's/.*=\s*"\([^"]*\)".*/\1/')
        if [ -z "$LOCATION" ]; then
            LOCATION="UAE North"  # fallback
        fi
        echo -e "${BLUE}Using location: $LOCATION${NC}"
        
        # Generate unique suffix using current timestamp instead of openssl
        SUFFIX=$(date +%s | tail -c 6)  # last 6 digits of timestamp
        
        # Create resource group with predictable name
        RESOURCE_GROUP="rg-crm-${ENVIRONMENT}-manual-${SUFFIX}"
        echo -e "${YELLOW}📦 Creating resource group: $RESOURCE_GROUP${NC}"
        az group create \
            --name "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --tags Environment="$ENVIRONMENT" Project="CRM" ManagedBy="Manual" \
            --output none
        
        # Generate ACR name (5-50 chars, alphanumeric only, globally unique)
        ACR_NAME="acrcrm${ENVIRONMENT}${SUFFIX}"
        ACR_NAME=$(echo "$ACR_NAME" | tr '[:upper:]' '[:lower:]')  # ensure lowercase
        
        echo -e "${YELLOW}📦 Creating ACR: $ACR_NAME in $RESOURCE_GROUP${NC}"
        if az acr create \
            --resource-group "$RESOURCE_GROUP" \
            --name "$ACR_NAME" \
            --sku Basic \
            --admin-enabled true \
            --location "$LOCATION" \
            --tags Environment="$ENVIRONMENT" Project="CRM" ManagedBy="Manual" \
            --output none; then
            
            ACR_SERVER="$ACR_NAME.azurecr.io"
            echo -e "${GREEN}✅ ACR created successfully: $ACR_SERVER${NC}"
            echo -e "${BLUE}ℹ️ ACR was created manually. You may need to import it into Terraform state later.${NC}"
        else
            echo -e "${RED}❌ Failed to create ACR with Azure CLI. Will skip container build.${NC}"
            ACR_NAME=""
            ACR_SERVER=""
        fi
    fi
fi

# If server still not known, query Azure for the actual loginServer
if [ -n "$ACR_NAME" ] && [ -z "$ACR_SERVER" ]; then
    ACR_SERVER=$(az acr show --name "$ACR_NAME" --query loginServer -o tsv 2>/dev/null || echo "")
fi

# Final fallback: use standard .azurecr.io suffix for AzureCloud
if [ -n "$ACR_NAME" ] && [ -z "$ACR_SERVER" ]; then
    CURRENT_CLOUD=$(az cloud show --query name -o tsv)
    if [ "$CURRENT_CLOUD" = "AzureCloud" ]; then
        ACR_SERVER="${ACR_NAME}.azurecr.io"
    else
        echo -e "${RED}❌ Unknown cloud: $CURRENT_CLOUD. Cannot determine ACR suffix.${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}ACR debug:${NC} name='${ACR_NAME}' server='${ACR_SERVER}' cloud='$(az cloud show --query name -o tsv)'"

# Only build and push if ACR exists
if [ -n "$ACR_NAME" ] && [ -n "$ACR_SERVER" ]; then
    echo -e "${YELLOW}📦 Building container image...${NC}"
    docker build --platform linux/amd64 -t "crm-app:${ENVIRONMENT}" .

    # Allow brief propagation time after potential ACR creation
    sleep 5

    # Login to ACR and push (use explicit docker login against server)
    ACR_USER=$(az acr credential show --name "$ACR_NAME" --query username -o tsv)
    ACR_PASS=$(az acr credential show --name "$ACR_NAME" --query passwords[0].value -o tsv)
    docker login "$ACR_SERVER" -u "$ACR_USER" -p "$ACR_PASS"
    docker tag "crm-app:${ENVIRONMENT}" "${ACR_SERVER}/crm-app:${ENVIRONMENT}"
    docker push "${ACR_SERVER}/crm-app:${ENVIRONMENT}"
    echo -e "${GREEN}✅ Container image pushed successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Skipping container build and push (ACR not available)${NC}"
    echo -e "${YELLOW}   Infrastructure will be deployed with placeholder image${NC}"
fi

# Deploy infrastructure
echo -e "${YELLOW}🏗️ Deploying infrastructure...${NC}"
cd "$TERRAFORM_DIR"

# Initialize Terraform
echo -e "${YELLOW}🔄 Initializing Terraform...${NC}"
terraform init -backend-config="$BACKEND_CONFIG"

# Plan the deployment
echo -e "${YELLOW}📋 Planning deployment...${NC}"
terraform plan -var-file="$ENV_FILE" -out="$ENVIRONMENT.tfplan"

# Ask for confirmation in production
if [ "$ENVIRONMENT" = "prod" ]; then
    echo -e "${YELLOW}⚠️ You are about to deploy to PRODUCTION. This will create real resources and incur costs.${NC}"
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Apply the plan
echo -e "${YELLOW}🚀 Applying infrastructure changes...${NC}"
terraform apply "$ENVIRONMENT.tfplan"

# Get outputs
echo -e "${YELLOW}📊 Getting deployment outputs...${NC}"
APP_URL=$(terraform output -raw application_url)
REGISTRY_NAME=$(terraform output -raw container_registry_name)
REGISTRY_SERVER=$(terraform output -raw container_registry_server)
DATABASE_SERVER=$(terraform output -raw database_server_fqdn)

# Update container image if ACR was just created
if [ -z "$ACR_NAME" ]; then
    echo -e "${YELLOW}📦 Container registry was just created. Building and pushing image...${NC}"
    cd "$ROOT_DIR/../../next"
    
    # Login to newly created ACR (explicit docker login)
    ACR_USER=$(az acr credential show --name "$REGISTRY_NAME" --query username -o tsv)
    ACR_PASS=$(az acr credential show --name "$REGISTRY_NAME" --query passwords[0].value -o tsv)
    
    # Build and push image
    docker build --platform linux/amd64 -t "crm-app:${ENVIRONMENT}" .
    # Resolve server from Azure directly, with safe fallback
    REGISTRY_SERVER=$(az acr show --name "$REGISTRY_NAME" --query loginServer -o tsv 2>/dev/null || echo "")
    if [ -z "$REGISTRY_SERVER" ]; then
        REGISTRY_SERVER="${REGISTRY_NAME}.azurecr.io"
    fi
    echo -e "${BLUE}ACR debug (post-apply):${NC} name='${REGISTRY_NAME}' server='${REGISTRY_SERVER}' cloud='$(az cloud show --query name -o tsv)'"
    docker login "$REGISTRY_SERVER" -u "$ACR_USER" -p "$ACR_PASS"
    docker tag "crm-app:${ENVIRONMENT}" "${REGISTRY_SERVER}/crm-app:${ENVIRONMENT}"
    docker push "${REGISTRY_SERVER}/crm-app:${ENVIRONMENT}"
    
    # Update Container App with new image
    echo -e "${YELLOW}🔄 Updating Container App with new image...${NC}"
    cd "$TERRAFORM_DIR"
    
    # Update the container image variable and re-apply
    terraform apply -var-file="$ENV_FILE" -var="container_image=crm-app:${ENVIRONMENT}" -auto-approve
fi

# Run database migrations
echo -e "${YELLOW}💾 Running database migrations...${NC}"
cd "$ROOT_DIR/../../next"

# Get database connection string from Key Vault
RESOURCE_GROUP=$(terraform -chdir="$TERRAFORM_DIR" output -raw resource_group_name)
KEY_VAULT_NAME=$(terraform -chdir="$TERRAFORM_DIR" output -raw key_vault_name)

# Get database credentials
DB_CONNECTION_STRING=$(az keyvault secret show \
    --vault-name "$KEY_VAULT_NAME" \
    --name "database-connection-string" \
    --query value \
    --output tsv)

# Run Prisma migrations
export DATABASE_URL="$DB_CONNECTION_STRING"
echo -e "${YELLOW}🔄 Deploying database schema...${NC}"
npx prisma migrate deploy

# Seed database if it's a new deployment
if [ "$ENVIRONMENT" = "dev" ]; then
    echo -e "${YELLOW}🌱 Seeding database with sample data...${NC}"
    npx prisma db seed 2>/dev/null || echo "No seed script found, skipping..."
fi

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
HEALTH_URL="${APP_URL}/api/health"
for i in {1..10}; do
    if curl -f -s "$HEALTH_URL" > /dev/null; then
        echo -e "${GREEN}✅ Health check passed${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for application to start (attempt $i/10)...${NC}"
        sleep 30
    fi
    
    if [ $i -eq 10 ]; then
        echo -e "${YELLOW}⚠️ Health check failed after 5 minutes. Check application logs.${NC}"
    fi
done

# Cleanup
rm -f "$TERRAFORM_DIR/$ENVIRONMENT.tfplan"

# Summary
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "  Environment: ${ENVIRONMENT}"
echo -e "  Application URL: ${APP_URL}"
echo -e "  Database Server: ${DATABASE_SERVER}"
echo -e "  Container Registry: ${REGISTRY_SERVER}"
echo -e ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "  1. Configure your custom domain (if applicable)"
echo -e "  2. Set up monitoring alerts"
echo -e "  3. Configure backup schedules"
echo -e "  4. Review security settings"
echo -e ""
echo -e "${GREEN}🎉 Your CRM application is now running at: ${APP_URL}${NC}"