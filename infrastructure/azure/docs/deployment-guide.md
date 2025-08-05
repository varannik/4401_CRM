# CRM Azure Deployment Guide

This guide provides step-by-step instructions for deploying the CRM application to Azure using Terraform.

## Prerequisites

Before starting the deployment, ensure you have the following tools installed:

- **Azure CLI** (v2.40+)
- **Terraform** (v1.0+)
- **Docker** (v20.0+)
- **Node.js** (v18+)
- **Git**

## Quick Start

### 1. Initial Setup

```bash
# Clone the repository and navigate to the infrastructure directory
cd /path/to/CRM/infrastructure/azure

# Run the initial Azure setup
./scripts/setup-azure.sh
```

This script will:
- Create a storage account for Terraform state
- Set up Azure AD application for authentication
- Generate sample environment configurations
- Create backend configuration files

### 2. Configure Environment

Edit the environment file for your target environment:

```bash
# For development
nano environments/dev.tfvars

# For staging
nano environments/staging.tfvars

# For production
nano environments/prod.tfvars
```

**Required configurations:**
- Update `azure_ad_client_secret` with a secure value
- Set a strong `db_admin_password`
- Configure `alert_email_addresses` for monitoring
- Review and adjust resource sizing for your needs

### 3. Deploy Infrastructure

```bash
# Deploy to development
./scripts/deploy.sh dev

# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh prod
```

The deployment script will:
- Build and push the container image
- Deploy all Azure resources
- Run database migrations
- Perform health checks

## Detailed Configuration

### Environment Variables

Each environment file (`environments/<env>.tfvars`) supports the following configurations:

#### Core Settings
```hcl
environment = "dev"                    # Environment name
location    = "East US 2"             # Azure region
owner       = "CRM-Team"              # Resource owner tag
```

#### Network Configuration
```hcl
vnet_address_space              = ["10.0.0.0/16"]
container_apps_subnet_address   = ["10.0.1.0/24"]
database_subnet_address         = ["10.0.2.0/24"]
redis_subnet_address           = ["10.0.3.0/24"]
```

#### Azure AD Authentication
```hcl
azure_ad_client_id     = "your-client-id"
azure_ad_client_secret = "your-client-secret"
azure_ad_tenant_id     = "your-tenant-id"
nextauth_secret        = "your-secure-random-string-32-chars-min"
```

#### Database Configuration
```hcl
db_admin_username = "crmadmin"
db_admin_password = "your-secure-password"
database_name     = "crmdb"
database_sku_name = "B_Standard_B1ms"  # Burstable for dev/staging
database_storage_mb = 32768            # 32 GB
```

#### Application Scaling
```hcl
min_replicas = 0    # Scale to zero for cost savings
max_replicas = 10   # Maximum number of instances
cpu_requests = "0.25"
memory_requests = "0.5Gi"
```

### Environment-Specific Recommendations

#### Development Environment
- **Database**: `B_Standard_B1ms` (Burstable)
- **Redis**: `Basic` tier
- **Container Registry**: `Basic`
- **Replicas**: 0-3 (scale to zero)
- **Backup Retention**: 7 days

#### Staging Environment
- **Database**: `GP_Standard_D2s_v3` (General Purpose)
- **Redis**: `Standard` tier
- **Container Registry**: `Standard`
- **Replicas**: 1-5 (always available)
- **Backup Retention**: 14 days

#### Production Environment
- **Database**: `GP_Standard_D4s_v3` with High Availability
- **Redis**: `Standard` or `Premium` tier
- **Container Registry**: `Premium` with scanning
- **Replicas**: 2-20 (high availability)
- **Backup Retention**: 30 days

## Post-Deployment Configuration

### 1. DNS and Custom Domain

If using a custom domain:

1. Create a DNS zone in Azure:
```bash
az network dns zone create \
  --resource-group your-dns-rg \
  --name yourdomain.com
```

2. Update the Terraform configuration:
```hcl
custom_domain = "app.yourdomain.com"
dns_zone_id   = "/subscriptions/.../resourceGroups/.../providers/Microsoft.Network/dnszones/yourdomain.com"
```

3. Re-deploy to apply changes:
```bash
./scripts/deploy.sh prod
```

### 2. SSL Certificate

Front Door automatically provides managed certificates for custom domains. The certificate will be provisioned within 24 hours of domain validation.

### 3. Monitoring Setup

1. **Configure Alerts**: Update `alert_email_addresses` in your environment file
2. **Set up Webhooks**: Configure `alert_webhook_url` for Slack/Teams integration
3. **Review Dashboard**: Access the monitoring dashboard in Azure Portal

### 4. Backup Configuration

Database backups are automatically configured:
- **Point-in-time restore**: Available for the retention period
- **Geo-redundant backups**: Enabled for production environments
- **Manual backups**: Can be triggered via Azure Portal

## Security Considerations

### Network Security
- All resources are deployed in a private VNet
- Network Security Groups restrict traffic
- Private endpoints used for database connections
- WAF policy protects the application

### Data Protection
- All secrets stored in Azure Key Vault
- Database encryption at rest and in transit
- Container images scanned for vulnerabilities
- HTTPS enforced throughout the stack

### Access Control
- Managed identities for service-to-service authentication
- RBAC controls for Azure resources
- Azure AD integration for application authentication

## Troubleshooting

### Common Issues

#### 1. Container Build Failures
```bash
# Check Docker daemon is running
docker info

# Verify Node.js version in Dockerfile
docker build --no-cache .
```

#### 2. Database Connection Issues
```bash
# Check network connectivity
az postgres flexible-server show \
  --resource-group <rg-name> \
  --name <server-name>

# Verify firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group <rg-name> \
  --name <server-name>
```

#### 3. Application Not Responding
```bash
# Check Container App logs
az containerapp logs show \
  --name <app-name> \
  --resource-group <rg-name>

# Check health endpoint
curl https://your-app-url/api/health
```

#### 4. Terraform State Issues
```bash
# List state resources
terraform state list

# Import existing resource if needed
terraform import azurerm_resource_group.main /subscriptions/.../resourceGroups/...
```

### Getting Help

1. **Application Logs**: Available in Azure Monitor and Application Insights
2. **Infrastructure Logs**: Check Terraform output and Azure Activity Log
3. **Support**: Contact the CRM team or create an issue in the repository

## Cost Optimization

### Development Environment
- Scale Container Apps to zero when not in use
- Use Burstable database tier
- Basic Redis and Container Registry tiers
- **Estimated monthly cost**: $50-100

### Staging Environment
- Keep minimal replicas running
- Standard tiers for better performance
- Regular backup retention
- **Estimated monthly cost**: $200-400

### Production Environment
- High availability configuration
- Premium tiers for performance
- Extended backup retention
- **Estimated monthly cost**: $800-1500

### Cost Monitoring
- Set up budget alerts in Azure
- Review cost analysis regularly
- Use reserved instances for predictable workloads
- Enable auto-shutdown for development resources

## Maintenance

### Regular Tasks
- **Weekly**: Review monitoring alerts and performance metrics
- **Monthly**: Update container images with security patches
- **Quarterly**: Review and update Terraform providers
- **Annually**: Review resource sizing and cost optimization

### Updates and Patches
```bash
# Update application
./scripts/build-and-push.sh dev latest
./scripts/deploy.sh dev

# Update infrastructure
terraform plan -var-file=environments/prod.tfvars
terraform apply
```

### Backup and Recovery
- Database: Point-in-time restore available
- Infrastructure: Terraform state stored in Azure Storage
- Application: Container images versioned in ACR

For more detailed information, see the [Architecture Documentation](architecture.md).