# Variables for container apps module

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
  description = "ID of the subnet for Container Apps"
  type        = string
}

variable "log_analytics_workspace_id" {
  description = "ID of the Log Analytics workspace"
  type        = string
}

variable "key_vault_id" {
  description = "ID of the Key Vault"
  type        = string
}

# Container Registry
variable "container_registry_server" {
  description = "Container registry server URL"
  type        = string
}

variable "container_registry_username" {
  description = "Container registry username"
  type        = string
  sensitive   = true
}

variable "container_registry_password" {
  description = "Container registry password"
  type        = string
  sensitive   = true
}

# Application Configuration
variable "container_image" {
  description = "Container image for the application"
  type        = string
}

variable "container_port" {
  description = "Port that the container listens on"
  type        = number
  default     = 3000
}

variable "min_replicas" {
  description = "Minimum number of container replicas"
  type        = number
  default     = 0
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

# Database and Cache
variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "redis_connection_string" {
  description = "Redis connection string"
  type        = string
  sensitive   = true
}

# Key Vault Secrets
variable "key_vault_secrets" {
  description = "Map of Key Vault secret references"
  type        = map(string)
  default     = {}
}

variable "nextauth_url" {
  description = "NextAuth URL for the application"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}