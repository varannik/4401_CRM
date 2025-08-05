# 🚀 CI/CD Deployment Guide for 44.01 CRM

This guide walks you through setting up automated deployment from GitHub to Azure using GitHub Actions.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Azure Setup](#azure-setup)
- [GitHub Repository Setup](#github-repository-setup)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [Environment Configuration](#environment-configuration)
- [Deployment Workflows](#deployment-workflows)
- [Monitoring & Troubleshooting](#monitoring--troubleshooting)

## 🔧 Prerequisites

### Required Tools
- **Azure CLI** (v2.40+)
- **Terraform** (v1.0+)
- **GitHub Account** with repository access
- **Azure Subscription** with appropriate permissions

### Required Permissions
- **Azure**: Contributor role on subscription
- **GitHub**: Admin access to repository
- **Azure AD**: Permission to create service principals

## ☁️ Azure Setup

### 1. Create Service Principal for GitHub Actions

```bash
# Login to Azure
az login

# Set subscription (replace with your subscription ID)
az account set --subscription "your-subscription-id"

# Create service principal for staging
az ad sp create-for-rbac \
  --name "github-actions-crm-staging" \
  --role "Contributor" \
  --scopes "/subscriptions/your-subscription-id" \
  --sdk-auth

# Create service principal for production  
az ad sp create-for-rbac \
  --name "github-actions-crm-production" \
  --role "Contributor" \
  --scopes "/subscriptions/your-subscription-id" \
  --sdk-auth
```

**⚠️ Important**: Save the JSON output from each command - you'll need it for GitHub secrets.

### 2. Create Terraform State Storage

```bash
# Create resource group for Terraform state
az group create \
  --name "rg-terraform-state" \
  --location "East US 2"

# Create storage account
az storage account create \
  --name "terraformstate$(date +%s)" \
  --resource-group "rg-terraform-state" \
  --location "East US 2" \
  --sku "Standard_LRS"

# Create container
az storage container create \
  --name "terraform-state" \
  --account-name "your-storage-account-name"
```

### 3. Create Azure AD Applications

```bash
# Create Azure AD app for staging
az ad app create \
  --display-name "CRM-Staging" \
  --available-to-other-tenants false

# Create Azure AD app for production
az ad app create \
  --display-name "CRM-Production" \
  --available-to-other-tenants false

# Create client secrets for each app (save these!)
az ad app credential reset --id "staging-app-id"
az ad app credential reset --id "production-app-id"
```

## 📁 GitHub Repository Setup

### 1. Repository Structure
```
your-repo/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd-staging.yml
│       └── cd-production.yml
├── 4401_CRM/
│   ├── next/
│   └── infrastructure/
└── DEPLOYMENT-GUIDE.md
```

### 2. Push Code to GitHub
```bash
# Add all files
git add .

# Commit changes
git commit -m "feat: Add CI/CD pipeline for Azure deployment"

# Push to GitHub
git push origin main
```

## 🔐 GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions

### Required Secrets

#### **Azure Credentials**
```
AZURE_CREDENTIALS_STAGING
AZURE_CREDENTIALS_PROD
```
*Use the JSON output from service principal creation*

#### **Terraform Configuration**
```
TERRAFORM_STORAGE_ACCOUNT=your-terraform-storage-account-name
TERRAFORM_RESOURCE_GROUP=rg-terraform-state
```

#### **Azure AD - Staging**
```
AZURE_AD_CLIENT_ID_STAGING=your-staging-app-client-id
AZURE_AD_CLIENT_SECRET_STAGING=your-staging-app-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id
```

#### **Azure AD - Production**
```
AZURE_AD_CLIENT_ID_PROD=your-production-app-client-id
AZURE_AD_CLIENT_SECRET_PROD=your-production-app-secret
```

#### **Application Secrets**
```
NEXTAUTH_SECRET_STAGING=generate-random-32-char-string-for-staging
NEXTAUTH_SECRET_PROD=generate-random-32-char-string-for-production
```

#### **Database Passwords**
```
DB_ADMIN_PASSWORD_STAGING=secure-staging-db-password
DB_ADMIN_PASSWORD_PROD=secure-production-db-password
```

#### **Test Environment (for CI)**
```
AZURE_AD_CLIENT_ID_TEST=test-client-id
AZURE_AD_CLIENT_SECRET_TEST=test-client-secret
NEXTAUTH_SECRET_TEST=test-secret-32-chars-minimum
```

### 🔑 Generate Secure Secrets

```bash
# Generate NextAuth secrets (32+ characters)
openssl rand -base64 32

# Generate database passwords (16+ characters)
openssl rand -base64 16
```

## 🌍 Environment Configuration

### Staging Environment (`staging.tfvars`)
```hcl
environment = "staging"
location    = "East US 2"
owner       = "CRM-Team"

# Database configuration
database_sku_name = "B_Gen5_1"  # Basic tier for staging
database_storage_mb = 32768      # 32GB

# Container Apps configuration  
min_replicas = 1
max_replicas = 3
cpu_requests = "0.5"
memory_requests = "1Gi"

# Container Registry
container_registry_sku = "Basic"

# Networking
vnet_address_space = ["10.1.0.0/16"]
container_apps_subnet_address = ["10.1.1.0/24"]
database_subnet_address = ["10.1.2.0/24"]
redis_subnet_address = ["10.1.3.0/24"]

# Monitoring
alert_email_addresses = ["team@44point01.com"]
```

### Production Environment (`prod.tfvars`)
```hcl
environment = "prod"
location    = "East US 2"
owner       = "CRM-Team"

# Database configuration
database_sku_name = "GP_Gen5_2"    # General Purpose for production
database_storage_mb = 102400        # 100GB
database_backup_retention_days = 35

# Container Apps configuration
min_replicas = 2
max_replicas = 10
cpu_requests = "1.0"
memory_requests = "2Gi"

# Container Registry
container_registry_sku = "Premium"  # Premium for production

# Redis configuration
redis_sku_name = "Standard"
redis_capacity = 1

# Networking
vnet_address_space = ["10.0.0.0/16"]
container_apps_subnet_address = ["10.0.1.0/24"]
database_subnet_address = ["10.0.2.0/24"]
redis_subnet_address = ["10.0.3.0/24"]

# Monitoring
alert_email_addresses = ["alerts@44point01.com", "team@44point01.com"]
alert_webhook_url = "https://your-teams-webhook-url"
```

## 🔄 Deployment Workflows

### 1. **CI Pipeline** (`.github/workflows/ci.yml`)
**Triggers**: Pull requests, pushes to `develop`
- Lint and type checking
- Build application
- Security scanning
- Docker image testing

### 2. **Staging Deployment** (`.github/workflows/cd-staging.yml`)
**Triggers**: Pushes to `develop` branch
- Deploy infrastructure with Terraform
- Build and push Docker image
- Deploy to Azure Container Apps
- Run health checks
- Run database migrations

### 3. **Production Deployment** (`.github/workflows/cd-production.yml`)
**Triggers**: Version tags (`v*.*.*`) or manual dispatch
- Pre-deployment security checks
- Blue-green deployment strategy
- Health checks before traffic switch
- Database migrations
- Cleanup old revisions

## 🚀 Deployment Process

### Deploy to Staging
```bash
# Push to develop branch
git checkout develop
git push origin develop

# Automatically deploys to staging
```

### Deploy to Production
```bash
# Create and push version tag
git tag v1.0.0
git push origin v1.0.0

# Or manually trigger via GitHub Actions UI
```

### Manual Production Deployment
1. Go to GitHub Actions
2. Select "CD - Deploy to Azure Production"
3. Click "Run workflow"
4. Enter version and options
5. Click "Run workflow"

## 📊 Monitoring & Troubleshooting

### Application URLs
- **Staging**: `https://crm-app-staging-[suffix].azurecontainerapps.io`
- **Production**: `https://crm-app-prod-[suffix].azurecontainerapps.io`

### Health Check Endpoints
- **Application**: `/api/health`
- **Webhook**: `/api/email-webhook` (GET)

### Azure Resources to Monitor
- **Container Apps**: Application logs and metrics
- **Container Registry**: Image builds and pushes
- **PostgreSQL**: Database performance
- **Redis Cache**: Cache hit rates
- **Key Vault**: Secret access logs

### Common Issues & Solutions

#### 1. **Build Failures**
```bash
# Check CI logs in GitHub Actions
# Common fixes:
- Update Node.js dependencies
- Fix TypeScript errors
- Resolve security vulnerabilities
```

#### 2. **Deployment Failures**
```bash
# Check Azure Container Apps logs
az containerapp logs show \
  --name "your-app-name" \
  --resource-group "your-rg" \
  --follow

# Check Terraform state
terraform plan -var-file="environments/staging.tfvars"
```

#### 3. **Database Migration Failures**
```bash
# Manually run migrations
DATABASE_URL="your-connection-string" npx prisma migrate deploy

# Reset migrations (staging only!)
DATABASE_URL="your-connection-string" npx prisma migrate reset
```

#### 4. **Health Check Failures**
```bash
# Check application logs
# Common issues:
- Database connection problems
- Redis connection issues
- Missing environment variables
```

### Rollback Strategy

#### Staging Rollback
```bash
# Redeploy previous revision
az containerapp revision set-mode \
  --name "your-app-staging" \
  --resource-group "your-rg" \
  --mode single \
  --revision "previous-revision-name"
```

#### Production Rollback
```bash
# Switch traffic back to previous revision
az containerapp traffic set \
  --name "your-app-prod" \
  --resource-group "your-rg" \
  --revision-weight "previous-revision=100,current-revision=0"
```

## 🔒 Security Best Practices

1. **Secrets Management**
   - Use GitHub secrets for sensitive data
   - Rotate secrets regularly
   - Use Azure Key Vault in production

2. **Network Security**
   - Enable private endpoints
   - Use VNet integration
   - Configure firewall rules

3. **Container Security**
   - Scan images for vulnerabilities
   - Use minimal base images
   - Run as non-root user

4. **Database Security**
   - Enable SSL connections
   - Use managed identity authentication
   - Regular backup verification

## 📞 Support

For deployment issues or questions:
1. Check GitHub Actions logs
2. Review Azure portal for resource status
3. Consult Azure Monitor logs
4. Contact the development team

---

## 🎯 Quick Start Commands

```bash
# 1. Clone and setup
git clone your-repo-url
cd your-repo

# 2. Set up Azure resources
./infrastructure/azure/scripts/setup-azure.sh

# 3. Configure GitHub secrets (see above)

# 4. Deploy to staging
git push origin develop

# 5. Deploy to production
git tag v1.0.0 && git push origin v1.0.0
```

Your CRM system will be automatically deployed with Redis caching, email webhook processing, and full monitoring! 🚀