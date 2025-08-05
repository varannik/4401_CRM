#!/bin/bash

# Setup script for Azure CRM infrastructure
# This script prepares Azure for Terraform deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up Azure infrastructure for CRM deployment${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️ You are not logged in to Azure. Please log in.${NC}"
    az login
fi

# Get current subscription
SUBSCRIPTION_ID=$(az account show --query id --output tsv)
SUBSCRIPTION_NAME=$(az account show --query name --output tsv)

echo -e "${GREEN}✅ Using subscription: ${SUBSCRIPTION_NAME} (${SUBSCRIPTION_ID})${NC}"

# Variables
LOCATION="East US 2"
STORAGE_RG_NAME="rg-crm-terraform-state"
STORAGE_ACCOUNT_NAME="stcrm$(date +%s)"
CONTAINER_NAME="tfstate"

# Create resource group for Terraform state
echo -e "${YELLOW}📦 Creating resource group for Terraform state...${NC}"
az group create \
    --name "$STORAGE_RG_NAME" \
    --location "$LOCATION" \
    --tags "Purpose=TerraformState" "Project=CRM"

# Create storage account
echo -e "${YELLOW}💾 Creating storage account for Terraform state...${NC}"
az storage account create \
    --name "$STORAGE_ACCOUNT_NAME" \
    --resource-group "$STORAGE_RG_NAME" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --encryption-services blob \
    --kind StorageV2 \
    --access-tier Hot \
    --tags "Purpose=TerraformState" "Project=CRM"

# Get storage account key
STORAGE_KEY=$(az storage account keys list \
    --resource-group "$STORAGE_RG_NAME" \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --query '[0].value' \
    --output tsv)

# Create container
echo -e "${YELLOW}📂 Creating storage container...${NC}"
az storage container create \
    --name "$CONTAINER_NAME" \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --account-key "$STORAGE_KEY"

# Enable versioning and soft delete
echo -e "${YELLOW}🔒 Enabling storage features for state protection...${NC}"
az storage account blob-service-properties update \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --enable-versioning true \
    --enable-delete-retention true \
    --delete-retention-days 30

# Create backend configuration file
BACKEND_CONFIG_FILE="../terraform/backend.conf"
echo -e "${YELLOW}📝 Creating Terraform backend configuration...${NC}"

cat > "$BACKEND_CONFIG_FILE" << EOF
resource_group_name  = "$STORAGE_RG_NAME"
storage_account_name = "$STORAGE_ACCOUNT_NAME"
container_name       = "$CONTAINER_NAME"
key                  = "terraform.tfstate"
EOF

# Create environment-specific backend configs
mkdir -p ../environments

for env in dev staging prod; do
    cat > "../environments/backend-${env}.conf" << EOF
resource_group_name  = "$STORAGE_RG_NAME"
storage_account_name = "$STORAGE_ACCOUNT_NAME"
container_name       = "$CONTAINER_NAME"
key                  = "${env}/terraform.tfstate"
EOF
done

# Create Azure AD application for the CRM
echo -e "${YELLOW}🔐 Creating Azure AD application...${NC}"

APP_NAME="CRM-Application"
APP_URI="https://crm-app-$(date +%s).azurewebsites.net"

# Create the application
APP_ID=$(az ad app create \
    --display-name "$APP_NAME" \
    --web-redirect-uris "${APP_URI}/api/auth/callback/azure-ad" \
    --query appId \
    --output tsv)

# Create service principal
SP_ID=$(az ad sp create --id "$APP_ID" --query id --output tsv)

# Generate client secret
CLIENT_SECRET=$(az ad app credential reset \
    --id "$APP_ID" \
    --query password \
    --output tsv)

# Get tenant ID
TENANT_ID=$(az account show --query tenantId --output tsv)

# Create sample environment file
echo -e "${YELLOW}📋 Creating sample environment configuration...${NC}"

cat > "../environments/dev.tfvars" << EOF
# Development environment configuration
environment = "dev"
location    = "$LOCATION"
owner       = "CRM-Team"

# Network Configuration
vnet_address_space              = ["10.0.0.0/16"]
container_apps_subnet_address   = ["10.0.1.0/24"]
database_subnet_address         = ["10.0.2.0/24"]
redis_subnet_address           = ["10.0.3.0/24"]

# Azure AD Configuration (Update with your values)
azure_ad_client_id     = "$APP_ID"
azure_ad_client_secret = "$CLIENT_SECRET"
azure_ad_tenant_id     = "$TENANT_ID"

# NextAuth Configuration (Generate a secure random string)
nextauth_secret = "$(openssl rand -base64 32)"

# Database Configuration
db_admin_username = "crmadmin"
db_admin_password = "$(openssl rand -base64 16)!"  # Change this!

# Development-specific settings
database_sku_name      = "B_Standard_B1ms"
redis_sku_name         = "Basic"
min_replicas          = 0
max_replicas          = 3
container_registry_sku = "Basic"

# Monitoring
alert_email_addresses = ["admin@yourcompany.com"]
EOF

# Copy for other environments
cp "../environments/dev.tfvars" "../environments/staging.tfvars"
cp "../environments/dev.tfvars" "../environments/prod.tfvars"

# Update staging and prod with appropriate settings
sed -i 's/environment = "dev"/environment = "staging"/' "../environments/staging.tfvars"
sed -i 's/environment = "dev"/environment = "prod"/' "../environments/prod.tfvars"

# Summary
echo -e "${GREEN}✅ Azure setup completed successfully!${NC}"
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "  Resource Group: ${STORAGE_RG_NAME}"
echo -e "  Storage Account: ${STORAGE_ACCOUNT_NAME}"
echo -e "  Azure AD App ID: ${APP_ID}"
echo -e "  Tenant ID: ${TENANT_ID}"
echo -e ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "  1. Review and update the environment files in ../environments/"
echo -e "  2. Update terraform.tfvars with your specific values"
echo -e "  3. Run ./deploy.sh <environment> to deploy"
echo -e ""
echo -e "${YELLOW}⚠️ Important:${NC}"
echo -e "  - Update database password in environment files"
echo -e "  - Configure your custom domain if needed"
echo -e "  - Review all configuration values before deployment"
echo -e "  - Store the Azure AD client secret securely"