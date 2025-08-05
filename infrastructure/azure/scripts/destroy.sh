#!/bin/bash

# Destruction script for Azure CRM infrastructure
# Usage: ./destroy.sh <environment>
# WARNING: This will DELETE ALL resources for the specified environment!

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

echo -e "${RED}⚠️  WARNING: About to DESTROY all CRM resources in ${ENVIRONMENT}${NC}"
echo -e "${RED}This action is IRREVERSIBLE!${NC}"
echo

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "prod" ]]; then
    echo -e "${RED}❌ Invalid environment. Use 'dev', 'staging', or 'prod'${NC}"
    exit 1
fi

# Check if environment file exists
ENV_FILE="$ROOT_DIR/environments/${ENVIRONMENT}.tfvars"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file not found: $ENV_FILE${NC}"
    exit 1
fi

# Check if backend configuration exists
BACKEND_CONFIG="$ROOT_DIR/environments/backend-${ENVIRONMENT}.conf"
if [ ! -f "$BACKEND_CONFIG" ]; then
    echo -e "${RED}❌ Backend configuration not found: $BACKEND_CONFIG${NC}"
    exit 1
fi

# Confirmation prompt
echo -e "${YELLOW}Resources that will be destroyed:${NC}"
echo "  • Resource Group: rg-crm-${ENVIRONMENT}-*"
echo "  • Container Apps Environment"
echo "  • Azure Database for PostgreSQL"
echo "  • Azure Container Registry"
echo "  • Azure Key Vault"
echo "  • Azure Redis Cache"
echo "  • Azure Monitor & Log Analytics"
echo "  • Azure Front Door"
echo "  • Virtual Network & Subnets"
echo

read -p "Type 'DESTROY' to confirm destruction of ${ENVIRONMENT} environment: " confirmation

if [ "$confirmation" != "DESTROY" ]; then
    echo -e "${GREEN}✅ Destruction cancelled. No resources were harmed.${NC}"
    exit 0
fi

echo -e "${BLUE}🔄 Initializing Terraform...${NC}"

# Initialize Terraform with backend config
cd "$TERRAFORM_DIR"
terraform init -backend-config="$BACKEND_CONFIG" -reconfigure

echo -e "${RED}💥 Destroying infrastructure for ${ENVIRONMENT}...${NC}"

# Run terraform destroy
terraform destroy \
    -var-file="$ENV_FILE" \
    -auto-approve

echo -e "${GREEN}✅ Infrastructure destroyed successfully!${NC}"
echo -e "${YELLOW}📝 Note: Storage account with Terraform state is preserved${NC}"
echo -e "${YELLOW}    Run 'az storage account delete' manually if you want to remove it${NC}"