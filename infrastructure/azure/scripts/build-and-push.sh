#!/bin/bash

# Container build and push script for CRM application
# Usage: ./build-and-push.sh <environment> [tag]

set -e

# Check if environment is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <environment> [tag]"
    echo "Available environments: dev, staging, prod"
    exit 1
fi

ENVIRONMENT=$1
TAG=${2:-latest}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
APP_DIR="$ROOT_DIR/../../next"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔨 Building and pushing CRM container image${NC}"

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "prod" ]]; then
    echo -e "${RED}❌ Invalid environment. Use 'dev', 'staging', or 'prod'${NC}"
    exit 1
fi

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed${NC}"
    exit 1
fi

if ! az account show &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Azure. Run 'az login'${NC}"
    exit 1
fi

# Get Container Registry name from Terraform output
TERRAFORM_DIR="$ROOT_DIR/terraform"
if [ ! -f "$TERRAFORM_DIR/.terraform/terraform.tfstate" ]; then
    echo -e "${RED}❌ Terraform state not found. Deploy infrastructure first.${NC}"
    exit 1
fi

ACR_NAME=$(terraform -chdir="$TERRAFORM_DIR" output -raw container_registry_name 2>/dev/null)
if [ -z "$ACR_NAME" ]; then
    echo -e "${RED}❌ Container registry name not found in Terraform output${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo -e "${BLUE}📦 Container Registry: ${ACR_NAME}.azurecr.io${NC}"

# Build the container image
echo -e "${YELLOW}🔨 Building container image...${NC}"
cd "$APP_DIR"

# Create build context with only necessary files
echo -e "${YELLOW}📂 Preparing build context...${NC}"

# Build the image
IMAGE_NAME="crm-app"
FULL_TAG="${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${TAG}"

docker build \
    --tag "${IMAGE_NAME}:${TAG}" \
    --tag "$FULL_TAG" \
    --build-arg NODE_ENV=production \
    --build-arg ENVIRONMENT="$ENVIRONMENT" \
    .

echo -e "${GREEN}✅ Container image built successfully${NC}"

# Login to Azure Container Registry
echo -e "${YELLOW}🔐 Logging in to Azure Container Registry...${NC}"
az acr login --name "$ACR_NAME"

# Push the image
echo -e "${YELLOW}📤 Pushing image to registry...${NC}"
docker push "$FULL_TAG"

# Also tag and push as latest for the environment
ENV_TAG="${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${ENVIRONMENT}-latest"
docker tag "${IMAGE_NAME}:${TAG}" "$ENV_TAG"
docker push "$ENV_TAG"

echo -e "${GREEN}✅ Image pushed successfully${NC}"

# Get image information
IMAGE_DIGEST=$(az acr repository show-manifests \
    --name "$ACR_NAME" \
    --repository "$IMAGE_NAME" \
    --query "[?tags[?contains(@, '${TAG}')]].digest" \
    --output tsv | head -n1)

IMAGE_SIZE=$(az acr repository show-manifests \
    --name "$ACR_NAME" \
    --repository "$IMAGE_NAME" \
    --query "[?tags[?contains(@, '${TAG}')]].imageSize" \
    --output tsv | head -n1)

# Convert bytes to MB
IMAGE_SIZE_MB=$((IMAGE_SIZE / 1024 / 1024))

# Security scan (if ACR has vulnerability scanning enabled)
echo -e "${YELLOW}🔍 Checking for vulnerability scan results...${NC}"
SCAN_RESULT=$(az acr repository show-manifests \
    --name "$ACR_NAME" \
    --repository "$IMAGE_NAME" \
    --query "[?tags[?contains(@, '${TAG}')]].quarantineState" \
    --output tsv 2>/dev/null || echo "NotScanned")

if [ "$SCAN_RESULT" = "Passed" ]; then
    echo -e "${GREEN}✅ Security scan passed${NC}"
elif [ "$SCAN_RESULT" = "Failed" ]; then
    echo -e "${RED}⚠️ Security scan failed. Check ACR for vulnerability details.${NC}"
else
    echo -e "${YELLOW}ℹ️ Security scan not available or pending${NC}"
fi

# Summary
echo -e "${GREEN}✅ Build and push completed successfully!${NC}"
echo -e "${BLUE}📋 Image Details:${NC}"
echo -e "  Registry: ${ACR_NAME}.azurecr.io"
echo -e "  Repository: ${IMAGE_NAME}"
echo -e "  Tag: ${TAG}"
echo -e "  Environment Tag: ${ENVIRONMENT}-latest"
echo -e "  Size: ${IMAGE_SIZE_MB} MB"
echo -e "  Digest: ${IMAGE_DIGEST}"
echo -e "  Security Scan: ${SCAN_RESULT}"
echo -e ""
echo -e "${YELLOW}📝 Full Image References:${NC}"
echo -e "  ${FULL_TAG}"
echo -e "  ${ENV_TAG}"
echo -e ""
echo -e "${GREEN}🎉 Container image is ready for deployment!${NC}"

# Cleanup local images if requested
read -p "Do you want to remove local images to save disk space? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Cleaning up local images...${NC}"
    docker rmi "${IMAGE_NAME}:${TAG}" "$FULL_TAG" "$ENV_TAG" 2>/dev/null || true
    echo -e "${GREEN}✅ Local images cleaned up${NC}"
fi