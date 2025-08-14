# 🚀 Azure Deployment Guide for 44.01 CRM

This guide will walk you through deploying your CRM application to Azure step by step.

## 📋 **Prerequisites**

### **Required Tools**
- ✅ **Azure CLI** (v2.40+)
- ✅ **Terraform** (v1.0+)
- ✅ **Docker** (for container builds)
- ✅ **Git** (for version control)

### **Required Azure Resources**
- ✅ **Azure Subscription** with billing enabled
- ✅ **Azure AD Tenant** (for authentication)
- ✅ **Azure AD Application** (for service authentication)

## 🎯 **Deployment Options**

### **Option 1: Automated Deployment (Recommended)**
Use the provided scripts for easy deployment.

### **Option 2: Manual Deployment**
Deploy each component manually for more control.

### **Option 3: CI/CD Pipeline**
Use GitHub Actions for automated deployments.

---

## 🚀 **Option 1: Automated Deployment (Recommended)**

### **Step 1: Initial Azure Setup**

```bash
# Navigate to Azure infrastructure directory
cd /Users/mohammadreza/Desktop/CRM/4401_CRM/infrastructure/azure

# Make scripts executable
chmod +x scripts/*.sh

# Run initial Azure setup
./scripts/setup-azure.sh
```

This script will:
- ✅ Login to Azure CLI
- ✅ Create service principals
- ✅ Set up Terraform state storage
- ✅ Configure Azure AD applications
- ✅ Generate secure secrets

### **Step 2: Configure Environment**

```bash
# Copy environment template
cp environments/dev.tfvars.example environments/dev.tfvars

# Edit the configuration
nano environments/dev.tfvars
```

**Required Configuration:**
```hcl
environment = "dev"
location    = "East US 2"
owner       = "Your Name"

# Database configuration
database_sku_name = "B_Gen5_1"
database_storage_mb = 32768

# Container Apps configuration
min_replicas = 1
max_replicas = 3
cpu_requests = "0.5"
memory_requests = "1Gi"

# Container Registry
container_registry_sku = "Basic"

# Redis configuration
redis_sku_name = "Basic"
redis_capacity = 0

# Networking
vnet_address_space = ["10.1.0.0/16"]
container_apps_subnet_address = ["10.1.1.0/24"]
database_subnet_address = ["10.1.2.0/24"]
redis_subnet_address = ["10.1.3.0/24"]

# Monitoring
alert_email_addresses = ["your-email@example.com"]
```

### **Step 3: Deploy Infrastructure**

```bash
# Deploy to development environment
./scripts/deploy.sh dev

# Or deploy to staging
./scripts/deploy.sh staging

# Or deploy to production
./scripts/deploy.sh prod
```

### **Step 4: Build and Deploy Application**

```bash
# Build and push container image
./scripts/build-and-push.sh dev

# Or use the full deployment script
./scripts/deploy.sh dev --with-app
```

---

## 🔧 **Option 2: Manual Deployment**

### **Step 1: Azure CLI Setup**

```bash
# Login to Azure
az login

# Set subscription (if you have multiple)
az account set --subscription "your-subscription-id"

# Verify current subscription
az account show
```

### **Step 2: Create Service Principal**

```bash
# Create service principal for Terraform
az ad sp create-for-rbac \
  --name "terraform-crm" \
  --role "Contributor" \
  --scopes "/subscriptions/your-subscription-id" \
  --sdk-auth
```

**Save the JSON output** - you'll need it for Terraform.

### **Step 3: Create Terraform State Storage**

```bash
# Create resource group for Terraform state
az group create \
  --name "rg-terraform-state" \
  --location "East US 2"

# Create storage account
az storage account create \
  --name "tfstate$(date +%s)" \
  --resource-group "rg-terraform-state" \
  --location "East US 2" \
  --sku "Standard_LRS"

# Create container
az storage container create \
  --name "terraform-state" \
  --account-name "your-storage-account-name"
```

### **Step 4: Configure Terraform**

```bash
# Navigate to Terraform directory
cd terraform

# Initialize Terraform
terraform init \
  -backend-config="storage_account_name=your-storage-account" \
  -backend-config="container_name=terraform-state" \
  -backend-config="key=dev.tfstate" \
  -backend-config="resource_group_name=rg-terraform-state"

# Plan the deployment
terraform plan -var-file="../environments/dev.tfvars"

# Apply the configuration
terraform apply -var-file="../environments/dev.tfvars" -auto-approve
```

### **Step 5: Deploy Application**

```bash
# Build Docker image
cd /Users/mohammadreza/Desktop/CRM/4401_CRM/next
docker build -t crm-app:latest .

# Login to Azure Container Registry
az acr login --name your-registry-name

# Tag and push image
docker tag crm-app:latest your-registry-name.azurecr.io/crm-app:latest
docker push your-registry-name.azurecr.io/crm-app:latest

# Deploy to Container Apps
az containerapp update \
  --name your-app-name \
  --resource-group your-resource-group \
  --image your-registry-name.azurecr.io/crm-app:latest
```

---

## 🔄 **Option 3: CI/CD Pipeline**

### **Step 1: Configure GitHub Secrets**

Go to your GitHub repository → Settings → Secrets and variables → Actions

**Required Secrets:**
```
AZURE_CREDENTIALS=your-service-principal-json
AZURE_AD_CLIENT_ID=your-app-client-id
AZURE_AD_CLIENT_SECRET=your-app-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
NEXTAUTH_SECRET=your-nextauth-secret
DB_ADMIN_PASSWORD=your-db-password
```

### **Step 2: Push to GitHub**

```bash
# Add all files
git add .

# Commit changes
git commit -m "feat: Add Azure infrastructure and CI/CD"

# Push to GitHub
git push origin main
```

### **Step 3: Deploy via GitHub Actions**

- **Staging**: Push to `develop` branch
- **Production**: Create a tag `v1.0.0`

---

## 🧪 **Testing Your Deployment**

### **Health Check**
```bash
# Get your application URL
az containerapp show \
  --name your-app-name \
  --resource-group your-resource-group \
  --query properties.configuration.ingress.fqdn -o tsv

# Test health endpoint
curl https://your-app-url/api/health
```

### **Email Webhook Test**
```bash
# Test webhook endpoint
curl -X GET https://your-app-url/api/email-webhook
```

### **Database Connection**
```bash
# Test database connection
az postgres flexible-server show \
  --name your-db-name \
  --resource-group your-resource-group
```

---

## 📊 **Monitoring Your Deployment**

### **Azure Portal**
- **Container Apps**: Application logs and metrics
- **PostgreSQL**: Database performance
- **Redis Cache**: Cache hit rates
- **Key Vault**: Secret access logs
- **Monitor**: Application insights

### **Application URLs**
- **Application**: `https://your-app-name.azurecontainerapps.io`
- **Health Check**: `https://your-app-name.azurecontainerapps.io/api/health`
- **Webhook**: `https://your-app-name.azurecontainerapps.io/api/email-webhook`

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Terraform State Issues**
```bash
# Reinitialize Terraform
terraform init -reconfigure
```

#### **2. Container Build Failures**
```bash
# Check Docker build locally
docker build -t crm-app:test .
```

#### **3. Application Startup Issues**
```bash
# Check Container Apps logs
az containerapp logs show \
  --name your-app-name \
  --resource-group your-resource-group \
  --follow
```

#### **4. Database Connection Issues**
```bash
# Test database connectivity
az postgres flexible-server firewall-rule create \
  --name "allow-all" \
  --resource-group your-resource-group \
  --server-name your-db-name \
  --start-ip-address "0.0.0.0" \
  --end-ip-address "255.255.255.255"
```

---

## 💰 **Cost Optimization**

### **Development Environment**
- Container Apps: Scale to 0 when not in use
- PostgreSQL: Basic tier (B_Gen5_1)
- Redis: Basic tier (0 capacity)
- Container Registry: Basic tier

### **Production Environment**
- Container Apps: Minimum 2 replicas
- PostgreSQL: General Purpose tier
- Redis: Standard tier (1 capacity)
- Container Registry: Premium tier

---

## 🔒 **Security Best Practices**

### **Network Security**
- Private endpoints for database
- VNet integration for Container Apps
- Firewall rules for Redis

### **Secrets Management**
- Azure Key Vault for all secrets
- Managed identities for authentication
- No hardcoded secrets in code

### **Container Security**
- Private Container Registry
- Image vulnerability scanning
- Non-root user execution

---

## 🎯 **Next Steps**

1. **Choose your deployment option** (Recommended: Option 1)
2. **Run the setup script** to configure Azure
3. **Deploy to development** first
4. **Test thoroughly** before production
5. **Set up monitoring** and alerts
6. **Configure CI/CD** for automated deployments

**Your CRM will be running on Azure with full email webhook processing and Redis caching!** 🚀 