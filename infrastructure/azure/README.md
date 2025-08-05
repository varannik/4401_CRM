# Azure Infrastructure as Code for CRM Application

This directory contains Terraform configurations for deploying the CRM application to Azure using best practices.

## Architecture Overview

- **Azure Container Apps**: Modern serverless container platform for the Next.js application
- **Azure Database for PostgreSQL**: Managed database service with high availability
- **Azure Key Vault**: Secure secrets and configuration management
- **Azure Container Registry**: Private container image registry
- **Azure Monitor**: Application insights and logging
- **Azure Redis Cache**: Session storage and caching
- **Azure Front Door**: Global load balancer with CDN and WAF
- **Azure Virtual Network**: Secure network isolation

## Directory Structure

```
azure/
├── README.md                          # This file
├── terraform/
│   ├── main.tf                        # Main Terraform configuration
│   ├── variables.tf                   # Input variables
│   ├── outputs.tf                     # Output values
│   ├── terraform.tfvars.example       # Example variables file
│   ├── versions.tf                    # Provider versions
│   └── modules/
│       ├── network/                   # Virtual Network module
│       ├── database/                  # PostgreSQL module
│       ├── container-registry/        # ACR module
│       ├── key-vault/                 # Key Vault module
│       ├── redis/                     # Redis Cache module
│       ├── container-apps/            # Container Apps module
│       ├── front-door/                # Front Door module
│       └── monitoring/                # Azure Monitor module
├── scripts/
│   ├── deploy.sh                      # Deployment script
│   ├── build-and-push.sh             # Container build and push
│   └── setup-azure.sh                # Initial Azure setup
├── environments/
│   ├── dev.tfvars                     # Development environment
│   ├── staging.tfvars                 # Staging environment
│   └── prod.tfvars                    # Production environment
└── docs/
    ├── deployment-guide.md            # Deployment instructions
    └── architecture.md                # Architecture documentation
```

## Quick Start

1. **Prerequisites**: Azure CLI, Terraform, Docker
2. **Setup**: Run `./scripts/setup-azure.sh`
3. **Configure**: Copy `terraform.tfvars.example` to `terraform.tfvars`
4. **Deploy**: Run `./scripts/deploy.sh <environment>`

## Environment Variables Required

- `AZURE_AD_CLIENT_ID`: Azure AD application client ID
- `AZURE_AD_CLIENT_SECRET`: Azure AD application client secret
- `AZURE_AD_TENANT_ID`: Azure AD tenant ID
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `EMAIL_WEBHOOK_SECRET`: Email webhook authentication secret (optional)

## Cost Optimization

- Container Apps scale to zero when not in use
- PostgreSQL with burstable performance tier for non-production
- Redis cache with basic tier for development
- Azure Front Door with optimized routing rules

## Security Features

- Network isolation with Virtual Network
- Private endpoints for database connections
- Managed identities for service authentication
- Key Vault integration for secrets
- Web Application Firewall with Front Door
- Container image security scanning