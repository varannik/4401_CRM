#!/bin/bash

# Setup script for CRM CI/CD pipeline
# This script helps configure Azure resources and GitHub secrets for automated deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to generate NextAuth secret
generate_nextauth_secret() {
    openssl rand -base64 32
}

print_status "🚀 Setting up CI/CD pipeline for 44.01 CRM"
echo

# Check prerequisites
print_status "📋 Checking prerequisites..."

if ! command_exists az; then
    print_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

if ! command_exists git; then
    print_error "Git is not installed. Please install it first."
    exit 1
fi

print_success "All prerequisites are installed"
echo

# Login to Azure
print_status "🔐 Logging into Azure..."
if ! az account show >/dev/null 2>&1; then
    az login
fi

# Get subscription info
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)

print_success "Logged into Azure"
print_status "Subscription ID: $SUBSCRIPTION_ID"
print_status "Tenant ID: $TENANT_ID"
echo

# Create Terraform state storage
print_status "🗄️ Setting up Terraform state storage..."

TERRAFORM_RG="rg-terraform-state-crm"
TERRAFORM_STORAGE="tfstate$(date +%s)"
LOCATION="eastus2"

# Create resource group
az group create \
    --name "$TERRAFORM_RG" \
    --location "$LOCATION" \
    --output none

# Create storage account
az storage account create \
    --name "$TERRAFORM_STORAGE" \
    --resource-group "$TERRAFORM_RG" \
    --location "$LOCATION" \
    --sku "Standard_LRS" \
    --output none

# Create container
az storage container create \
    --name "terraform-state" \
    --account-name "$TERRAFORM_STORAGE" \
    --output none

print_success "Terraform state storage created"
print_status "Storage Account: $TERRAFORM_STORAGE"
echo

# Create service principals
print_status "👤 Creating service principals for GitHub Actions..."

# Staging service principal
print_status "Creating staging service principal..."
STAGING_SP=$(az ad sp create-for-rbac \
    --name "github-actions-crm-staging" \
    --role "Contributor" \
    --scopes "/subscriptions/$SUBSCRIPTION_ID" \
    --sdk-auth \
    --output json)

# Production service principal  
print_status "Creating production service principal..."
PROD_SP=$(az ad sp create-for-rbac \
    --name "github-actions-crm-production" \
    --role "Contributor" \
    --scopes "/subscriptions/$SUBSCRIPTION_ID" \
    --sdk-auth \
    --output json)

print_success "Service principals created"
echo

# Create Azure AD applications
print_status "📱 Creating Azure AD applications..."

# Staging app
STAGING_APP=$(az ad app create \
    --display-name "CRM-Staging" \
    --available-to-other-tenants false \
    --query appId -o tsv)

STAGING_SECRET=$(az ad app credential reset \
    --id "$STAGING_APP" \
    --query password -o tsv)

# Production app
PROD_APP=$(az ad app create \
    --display-name "CRM-Production" \
    --available-to-other-tenants false \
    --query appId -o tsv)

PROD_SECRET=$(az ad app credential reset \
    --id "$PROD_APP" \
    --query password -o tsv)

print_success "Azure AD applications created"
print_status "Staging App ID: $STAGING_APP"
print_status "Production App ID: $PROD_APP"
echo

# Generate application secrets
print_status "🔑 Generating application secrets..."

NEXTAUTH_SECRET_STAGING=$(generate_nextauth_secret)
NEXTAUTH_SECRET_PROD=$(generate_nextauth_secret)
NEXTAUTH_SECRET_TEST=$(generate_nextauth_secret)

DB_PASSWORD_STAGING=$(generate_password)
DB_PASSWORD_PROD=$(generate_password)

print_success "Application secrets generated"
echo

# Create secrets file
SECRETS_FILE="github-secrets.txt"
print_status "📝 Creating GitHub secrets file: $SECRETS_FILE"

cat > "$SECRETS_FILE" << EOF
# GitHub Secrets Configuration for 44.01 CRM CI/CD
# Copy these values to your GitHub repository secrets

# ===================================
# Azure Credentials
# ===================================
AZURE_CREDENTIALS_STAGING=$STAGING_SP

AZURE_CREDENTIALS_PROD=$PROD_SP

# ===================================
# Terraform Configuration
# ===================================
TERRAFORM_STORAGE_ACCOUNT=$TERRAFORM_STORAGE
TERRAFORM_RESOURCE_GROUP=$TERRAFORM_RG

# ===================================
# Azure AD - Staging
# ===================================
AZURE_AD_CLIENT_ID_STAGING=$STAGING_APP
AZURE_AD_CLIENT_SECRET_STAGING=$STAGING_SECRET
AZURE_AD_TENANT_ID=$TENANT_ID

# ===================================
# Azure AD - Production
# ===================================
AZURE_AD_CLIENT_ID_PROD=$PROD_APP
AZURE_AD_CLIENT_SECRET_PROD=$PROD_SECRET

# ===================================
# Application Secrets
# ===================================
NEXTAUTH_SECRET_STAGING=$NEXTAUTH_SECRET_STAGING
NEXTAUTH_SECRET_PROD=$NEXTAUTH_SECRET_PROD

# ===================================
# Database Passwords
# ===================================
DB_ADMIN_PASSWORD_STAGING=$DB_PASSWORD_STAGING
DB_ADMIN_PASSWORD_PROD=$DB_PASSWORD_PROD

# ===================================
# Test Environment (for CI)
# ===================================
AZURE_AD_CLIENT_ID_TEST=$STAGING_APP
AZURE_AD_CLIENT_SECRET_TEST=$STAGING_SECRET
NEXTAUTH_SECRET_TEST=$NEXTAUTH_SECRET_TEST
EOF

print_success "GitHub secrets file created: $SECRETS_FILE"
echo

# Create environment files
print_status "🌍 Creating Terraform environment files..."

# Staging environment
cat > "infrastructure/azure/environments/staging.tfvars" << EOF
# Staging Environment Configuration
environment = "staging"
location    = "$LOCATION"
owner       = "CRM-Team"

# Database configuration
database_sku_name = "B_Gen5_1"
database_storage_mb = 32768
database_backup_retention_days = 7

# Container Apps configuration
min_replicas = 1
max_replicas = 3
cpu_requests = "0.5"
memory_requests = "1Gi"
container_port = 3000

# Container Registry
container_registry_sku = "Basic"

# Redis configuration
redis_sku_name = "Basic"
redis_capacity = 0
redis_family = "C"

# Networking
vnet_address_space = ["10.1.0.0/16"]
container_apps_subnet_address = ["10.1.1.0/24"]
database_subnet_address = ["10.1.2.0/24"]
redis_subnet_address = ["10.1.3.0/24"]

# Monitoring
alert_email_addresses = ["team@44point01.com"]

# Application
container_image = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
database_name = "crmdb"
db_admin_username = "crmadmin"
EOF

# Production environment
cat > "infrastructure/azure/environments/prod.tfvars" << EOF
# Production Environment Configuration
environment = "prod"
location    = "$LOCATION"
owner       = "CRM-Team"

# Database configuration
database_sku_name = "GP_Gen5_2"
database_storage_mb = 102400
database_backup_retention_days = 35

# Container Apps configuration
min_replicas = 2
max_replicas = 10
cpu_requests = "1.0"
memory_requests = "2Gi"
container_port = 3000

# Container Registry
container_registry_sku = "Premium"

# Redis configuration
redis_sku_name = "Standard"
redis_capacity = 1
redis_family = "C"

# Networking
vnet_address_space = ["10.0.0.0/16"]
container_apps_subnet_address = ["10.0.1.0/24"]
database_subnet_address = ["10.0.2.0/24"]
redis_subnet_address = ["10.0.3.0/24"]

# Monitoring
alert_email_addresses = ["alerts@44point01.com", "team@44point01.com"]

# Application
container_image = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
database_name = "crmdb"
db_admin_username = "crmadmin"
EOF

print_success "Environment files created"
echo

# Setup Git hooks (if in git repo)
if [ -d .git ]; then
    print_status "📚 Setting up Git..."
    
    # Add files to git
    git add .github/
    git add infrastructure/azure/environments/
    git add DEPLOYMENT-GUIDE.md
    git add scripts/setup-cicd.sh
    
    print_success "Files added to Git"
fi

# Final instructions
print_success "🎉 CI/CD setup completed successfully!"
echo
print_warning "📋 Next Steps:"
echo "1. 📂 Copy the secrets from '$SECRETS_FILE' to your GitHub repository:"
echo "   - Go to GitHub.com → Your Repository → Settings → Secrets and Variables → Actions"
echo "   - Add each secret from the file"
echo
echo "2. 🔐 Secure the secrets file:"
echo "   - Store '$SECRETS_FILE' in a secure location"
echo "   - Delete it from this directory after copying secrets"
echo
echo "3. 🚀 Push your code to GitHub:"
echo "   git commit -m 'feat: Add CI/CD pipeline'"
echo "   git push origin main"
echo
echo "4. 🧪 Test the pipeline:"
echo "   - Push to 'develop' branch to deploy to staging"
echo "   - Create a tag 'v1.0.0' to deploy to production"
echo
echo "5. 📊 Monitor deployments:"
echo "   - Check GitHub Actions for build status"
echo "   - Monitor Azure resources in the portal"
echo
print_warning "⚠️  Important: Review and update email addresses in environment files!"
print_warning "⚠️  Important: Delete '$SECRETS_FILE' after copying to GitHub!"
echo
print_success "Your CRM CI/CD pipeline is ready! 🚀"