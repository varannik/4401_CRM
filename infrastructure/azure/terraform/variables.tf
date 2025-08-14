# Input variables for CRM Azure infrastructure

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US 2"
}

variable "owner" {
  description = "Owner of the resources (for tagging)"
  type        = string
  default     = "CRM-Team"
}

# Network Configuration
variable "vnet_address_space" {
  description = "Address space for the virtual network"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "container_apps_subnet_address" {
  description = "Address space for Container Apps subnet"
  type        = list(string)
  default     = ["10.0.1.0/24"]
}

variable "database_subnet_address" {
  description = "Address space for database subnet"
  type        = list(string)
  default     = ["10.0.2.0/24"]
}

variable "redis_subnet_address" {
  description = "Address space for Redis subnet"
  type        = list(string)
  default     = ["10.0.3.0/24"]
}

# Container Registry Configuration
variable "container_registry_sku" {
  description = "SKU for Azure Container Registry"
  type        = string
  default     = "Basic"
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.container_registry_sku)
    error_message = "Container registry SKU must be Basic, Standard, or Premium."
  }
}

# Database Configuration
variable "db_admin_username" {
  description = "Administrator username for PostgreSQL"
  type        = string
  default     = "crmadmin"
  sensitive   = true
}

variable "db_admin_password" {
  description = "Administrator password for PostgreSQL"
  type        = string
  sensitive   = true
}

variable "database_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "crmdb"
}

variable "database_sku_name" {
  description = "SKU name for PostgreSQL server"
  type        = string
  default     = "B_Standard_B1ms"  # Burstable, 1 vCore, 2GB RAM
}

variable "database_storage_mb" {
  description = "Storage size in MB for PostgreSQL"
  type        = number
  default     = 32768  # 32 GB
}

variable "database_backup_retention_days" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

# Redis Configuration
variable "redis_capacity" {
  description = "Redis cache capacity"
  type        = number
  default     = 0  # 250 MB for Basic C0
}

variable "redis_family" {
  description = "Redis cache family"
  type        = string
  default     = "C"
}

variable "redis_sku_name" {
  description = "Redis cache SKU"
  type        = string
  default     = "Basic"
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.redis_sku_name)
    error_message = "Redis SKU must be Basic, Standard, or Premium."
  }
}

# Container Apps Configuration
variable "container_image" {
  description = "Container image for the CRM application"
  type        = string
  default     = "crm-app:latest"
}

variable "container_port" {
  description = "Port that the container listens on"
  type        = number
  default     = 3000
}

variable "min_replicas" {
  description = "Minimum number of container replicas"
  type        = number
  default     = 0  # Scale to zero
}

variable "max_replicas" {
  description = "Maximum number of container replicas"
  type        = number
  default     = 10
}

variable "cpu_requests" {
  description = "CPU requests for container"
  type        = string
  default     = "0.25"
}

variable "memory_requests" {
  description = "Memory requests for container"
  type        = string
  default     = "0.5Gi"
}

# Application Secrets
variable "azure_ad_client_id" {
  description = "Azure AD Application Client ID"
  type        = string
  sensitive   = true
}

variable "azure_ad_client_secret" {
  description = "Azure AD Application Client Secret"
  type        = string
  sensitive   = true
}

variable "azure_ad_tenant_id" {
  description = "Azure AD Tenant ID"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth.js secret key"
  type        = string
  sensitive   = true
}

variable "email_webhook_secret" {
  description = "Email webhook authentication secret"
  type        = string
  default     = ""
  sensitive   = true
}

# Front Door Configuration
variable "custom_domain" {
  description = "Custom domain for the application (optional)"
  type        = string
  default     = ""
}

variable "dns_zone_id" {
  description = "DNS zone ID for custom domain (optional)"
  type        = string
  default     = ""
}

# Monitoring Configuration
variable "alert_email_addresses" {
  description = "List of email addresses for monitoring alerts"
  type        = list(string)
  default     = []
}

variable "alert_webhook_url" {
  description = "Webhook URL for monitoring alerts (Slack, Teams, etc.)"
  type        = string
  default     = ""
  sensitive   = true
}

# Environment-specific overrides
variable "environment_config" {
  description = "Environment-specific configuration overrides"
  type = object({
    database_sku_name             = optional(string)
    database_storage_mb           = optional(number)
    redis_sku_name               = optional(string)
    redis_capacity               = optional(number)
    container_registry_sku       = optional(string)
    min_replicas                 = optional(number)
    max_replicas                 = optional(number)
    backup_retention_days        = optional(number)
  })
  default = {}
}