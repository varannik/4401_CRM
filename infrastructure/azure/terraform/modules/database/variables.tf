# Variables for database module

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "resource_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet for the database"
  type        = string
}

variable "private_dns_zone_id" {
  description = "ID of the private DNS zone for the database"
  type        = string
}

variable "administrator_login" {
  description = "Administrator username for PostgreSQL"
  type        = string
}

variable "administrator_password" {
  description = "Administrator password for PostgreSQL"
  type        = string
  sensitive   = true
  default     = ""
}

variable "database_name" {
  description = "Name of the PostgreSQL database"
  type        = string
}

variable "sku_name" {
  description = "SKU name for PostgreSQL server"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "storage_mb" {
  description = "Storage size in MB for PostgreSQL"
  type        = number
  default     = 32768
}

variable "backup_retention_days" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "key_vault_id" {
  description = "ID of the Key Vault to store secrets"
  type        = string
}

variable "log_analytics_workspace_id" {
  description = "ID of the Log Analytics workspace for diagnostics"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}