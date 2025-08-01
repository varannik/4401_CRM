#!/bin/bash

# Initial Docker Build and Push Script
# Usage: ./scripts/initial-docker-push.sh [staging|production]

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

echo -e "${BLUE}🐳 Building and pushing initial Docker image for ${ENVIRONMENT}${NC}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi

# Get ECR repository URI from CloudFormation stack
echo -e "${YELLOW}📋 Getting ECR repository URI...${NC}"
ECR_URI=$(aws cloudformation describe-stacks \
    --stack-name "crm-apprunner-${ENVIRONMENT}" \
    --query "Stacks[0].Outputs[?OutputKey=='EcrRepositoryUri'].OutputValue" \
    --output text)

if [ -z "$ECR_URI" ]; then
    echo -e "${RED}❌ Could not find ECR repository URI. Make sure the infrastructure is deployed first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ ECR Repository: ${ECR_URI}${NC}"

# Login to ECR
echo -e "${YELLOW}🔐 Logging into ECR...${NC}"
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $ECR_URI

# Build Docker image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
cd "$ROOT_DIR/next"

# Create a simple placeholder for the first build (since we don't have all dependencies yet)
cat > temp.Dockerfile << 'EOF'
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Simple health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
EOF

# Use temp Dockerfile if regular Dockerfile doesn't exist or fails
if [ -f "Dockerfile" ]; then
    echo -e "${YELLOW}📦 Using existing Dockerfile...${NC}"
    DOCKERFILE="Dockerfile"
else
    echo -e "${YELLOW}📦 Using temporary Dockerfile...${NC}"
    DOCKERFILE="temp.Dockerfile"
fi

# Build image
IMAGE_TAG="initial-$(date +%Y%m%d%H%M%S)"
docker build -f $DOCKERFILE -t $ECR_URI:$IMAGE_TAG .
docker tag $ECR_URI:$IMAGE_TAG $ECR_URI:latest

# Push image
echo -e "${YELLOW}🚀 Pushing Docker image...${NC}"
docker push $ECR_URI:$IMAGE_TAG
docker push $ECR_URI:latest

# Clean up
rm -f temp.Dockerfile

echo -e "${GREEN}✅ Successfully pushed Docker image!${NC}"
echo -e "${BLUE}📦 Image: ${ECR_URI}:${IMAGE_TAG}${NC}"
echo -e "${BLUE}📦 Latest: ${ECR_URI}:latest${NC}"

# Trigger App Runner deployment if service exists
echo -e "${YELLOW}🔄 Checking for App Runner service...${NC}"
SERVICE_ARN=$(aws cloudformation describe-stacks \
    --stack-name "crm-apprunner-${ENVIRONMENT}" \
    --query "Stacks[0].Outputs[?OutputKey=='ServiceArn'].OutputValue" \
    --output text 2>/dev/null || echo "")

if [ -n "$SERVICE_ARN" ]; then
    echo -e "${YELLOW}🚀 Triggering App Runner deployment...${NC}"
    aws apprunner start-deployment --service-arn "$SERVICE_ARN"
    echo -e "${GREEN}✅ App Runner deployment triggered!${NC}"
else
    echo -e "${YELLOW}⚠️ App Runner service not found. The image is ready for when the service is created.${NC}"
fi

echo -e "${GREEN}🎉 Initial Docker push completed successfully!${NC}" 