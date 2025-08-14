# Main Terraform configuration for CRM Azure deployment

terraform {
  required_version = ">= 1.0"
  
  backend "azurerm" {
    # Backend configuration will be provided during init
    # Use Azure Storage Account for state management
  }
  
}

# Configure the Azure Provider
provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# Get current Azure client configuration
data "azurerm_client_config" "current" {}

# Generate random suffix for resource names
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Main resource group
resource "azurerm_resource_group" "main" {
  name     = "rg-crm-${var.environment}-${random_string.suffix.result}"
  location = var.location

  tags = local.common_tags
}

# Local values for common configurations
locals {
  common_tags = {
    Environment = var.environment
    Project     = "CRM"
    Owner       = var.owner
    ManagedBy   = "Terraform"
    CreatedDate = formatdate("YYYY-MM-DD", timestamp())
  }
  
  resource_prefix = "crm-${var.environment}-${random_string.suffix.result}"
}

# Virtual Network module
module "network" {
  source = "./modules/network"
  
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  resource_prefix    = local.resource_prefix
  environment        = var.environment
  
  vnet_address_space               = var.vnet_address_space
  container_apps_subnet_address    = var.container_apps_subnet_address
  database_subnet_address          = var.database_subnet_address
  redis_subnet_address             = var.redis_subnet_address
  
  tags = local.common_tags
}

# Container Registry module
module "container_registry" {
  source = "./modules/container-registry"
  
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  resource_prefix    = local.resource_prefix
  environment        = var.environment
  sku                = var.container_registry_sku
  
  tags = local.common_tags
}

# Key Vault module
module "key_vault" {
  source = "./modules/key-vault"
  
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  resource_prefix    = local.resource_prefix
  environment        = var.environment
  tenant_id          = data.azurerm_client_config.current.tenant_id
  
  # Application secrets
  secrets = {
    "AZURE-AD-CLIENT-ID"      = var.azure_ad_client_id
    "AZURE-AD-CLIENT-SECRET"  = var.azure_ad_client_secret
    "AZURE-AD-TENANT-ID"      = var.azure_ad_tenant_id
    "NEXTAUTH-SECRET"         = var.nextauth_secret
    "EMAIL-WEBHOOK-SECRET"    = var.email_webhook_secret
  }
  
  tags = local.common_tags
}

# Monitoring module (created first to provide workspace)
module "monitoring" {
  source = "./modules/monitoring"
  
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  resource_prefix    = local.resource_prefix
  environment        = var.environment
  
  # These will be empty initially, updated after other modules are created
  container_app_id   = ""
  database_server_id = ""
  redis_cache_id     = ""
  
  alert_email_addresses = var.alert_email_addresses
  webhook_url           = var.alert_webhook_url
  
  tags = local.common_tags
}

# Database module
module "database" {
  source = "./modules/database"
  
  resource_group_name     = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  resource_prefix        = local.resource_prefix
  environment            = var.environment
  
  subnet_id              = null
  private_dns_zone_id    = null
  
  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password
  database_name          = var.database_name
  sku_name              = var.database_sku_name
  storage_mb            = var.database_storage_mb
  backup_retention_days = var.database_backup_retention_days
  
  key_vault_id                  = module.key_vault.key_vault_id
  log_analytics_workspace_id    = module.monitoring.log_analytics_workspace_id
  
  tags = local.common_tags
  
  # Ensure Key Vault access policy is fully applied before creating secrets
  depends_on = [module.key_vault]
}

# Redis Cache module
module "redis" {
  source = "./modules/redis"
  
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  resource_prefix    = local.resource_prefix
  environment        = var.environment
  
  subnet_id          = module.network.redis_subnet_id
  capacity           = var.redis_capacity
  family             = var.redis_family
  sku_name          = var.redis_sku_name
  
  key_vault_id      = module.key_vault.key_vault_id
  
  tags = local.common_tags
}

# Container Apps module
module "container_apps" {
  source = "./modules/container-apps"
  
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  resource_prefix    = local.resource_prefix
  environment        = var.environment
  
  subnet_id                    = module.network.container_apps_subnet_id
  log_analytics_workspace_id   = module.monitoring.log_analytics_workspace_id
  key_vault_id                 = module.key_vault.key_vault_id
  
  container_registry_server    = module.container_registry.registry_server
  container_registry_username  = module.container_registry.admin_username
  container_registry_password  = module.container_registry.admin_password
  
  # Application configuration
  container_image              = var.container_image
  container_port              = var.container_port
  min_replicas                = var.min_replicas
  max_replicas                = var.max_replicas
  cpu_requests                = var.cpu_requests
  memory_requests             = var.memory_requests
  
  # Database connection
  database_url                = module.database.connection_string
  
  # Key Vault secrets (names must be lowercase alphanumeric with - or . only)
  key_vault_secrets = {
    azure-ad-client-id     = module.key_vault.secret_uris["AZURE-AD-CLIENT-ID"]
    azure-ad-client-secret = module.key_vault.secret_uris["AZURE-AD-CLIENT-SECRET"]
    azure-ad-tenant-id     = module.key_vault.secret_uris["AZURE-AD-TENANT-ID"]
    nextauth-secret        = module.key_vault.secret_uris["NEXTAUTH-SECRET"]
    email-webhook-secret   = module.key_vault.secret_uris["EMAIL-WEBHOOK-SECRET"]
  }
  
  # Redis connection
  redis_connection_string     = module.redis.connection_string
  
  # NextAuth URL - use Front Door URL if custom domain is provided, otherwise use Container App URL
  nextauth_url               = var.custom_domain != "" ? "https://${var.custom_domain}" : "https://crm-${var.environment}.azurefd.net"
  
  tags = local.common_tags
  
  depends_on = [
    module.database,
    module.redis,
    module.key_vault,
    module.monitoring
  ]
}

# Front Door module
module "front_door" {
  source = "./modules/front-door"
  
  resource_group_name = azurerm_resource_group.main.name
  resource_prefix    = local.resource_prefix
  environment        = var.environment
  
  backend_address    = module.container_apps.app_url
  custom_domain      = var.custom_domain
  dns_zone_id        = var.dns_zone_id
  
  tags = local.common_tags
  
  depends_on = [module.container_apps]
}
