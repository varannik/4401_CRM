# Output values for CRM Azure infrastructure

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.main.location
}

# Network outputs
output "virtual_network_id" {
  description = "ID of the virtual network"
  value       = module.network.virtual_network_id
}

output "virtual_network_name" {
  description = "Name of the virtual network"
  value       = module.network.virtual_network_name
}

# Container Registry outputs
output "container_registry_name" {
  description = "Name of the Azure Container Registry"
  value       = module.container_registry.registry_name
}

output "container_registry_server" {
  description = "Login server URL for Azure Container Registry"
  value       = module.container_registry.registry_server
}

output "container_registry_admin_username" {
  description = "Admin username for Azure Container Registry"
  value       = module.container_registry.admin_username
  sensitive   = true
}

# Database outputs
output "database_server_name" {
  description = "Name of the PostgreSQL server"
  value       = module.database.server_name
}

output "database_server_fqdn" {
  description = "FQDN of the PostgreSQL server"
  value       = module.database.server_fqdn
}

output "database_name" {
  description = "Name of the PostgreSQL database"
  value       = module.database.database_name
}

output "database_connection_string" {
  description = "Connection string for the PostgreSQL database"
  value       = module.database.connection_string
  sensitive   = true
}

# Redis outputs
output "redis_cache_name" {
  description = "Name of the Redis cache"
  value       = module.redis.redis_name
}

output "redis_cache_hostname" {
  description = "Hostname of the Redis cache"
  value       = module.redis.redis_hostname
}

output "redis_connection_string" {
  description = "Connection string for Redis cache"
  value       = module.redis.connection_string
  sensitive   = true
}

# Key Vault outputs
output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = module.key_vault.key_vault_name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = module.key_vault.key_vault_uri
}

# Container Apps outputs
output "container_app_name" {
  description = "Name of the Container App"
  value       = module.container_apps.container_app_name
}

output "container_app_url" {
  description = "URL of the Container App"
  value       = module.container_apps.app_url
}

output "container_app_fqdn" {
  description = "FQDN of the Container App"
  value       = module.container_apps.app_fqdn
}

# Front Door outputs
output "front_door_name" {
  description = "Name of the Front Door profile"
  value       = module.front_door.front_door_name
}

output "front_door_endpoint_hostname" {
  description = "Hostname of the Front Door endpoint"
  value       = module.front_door.endpoint_hostname
}

output "application_url" {
  description = "Primary URL to access the application"
  value       = var.custom_domain != "" ? "https://${var.custom_domain}" : "https://${module.front_door.endpoint_hostname}"
}

# Monitoring outputs
output "application_insights_name" {
  description = "Name of Application Insights"
  value       = module.monitoring.application_insights_name
}

output "application_insights_instrumentation_key" {
  description = "Instrumentation key for Application Insights"
  value       = module.monitoring.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Connection string for Application Insights"
  value       = module.monitoring.connection_string
  sensitive   = true
}

# Deployment information
output "deployment_info" {
  description = "Summary of deployed resources"
  value = {
    environment           = var.environment
    location             = var.location
    resource_group       = azurerm_resource_group.main.name
    application_url      = var.custom_domain != "" ? "https://${var.custom_domain}" : "https://${module.front_door.endpoint_hostname}"
    container_registry   = module.container_registry.registry_server
    database_server      = module.database.server_fqdn
    redis_cache         = module.redis.redis_hostname
    key_vault           = module.key_vault.key_vault_name
    application_insights = module.monitoring.application_insights_name
  }
}

# Security and access information
output "managed_identity_principal_id" {
  description = "Principal ID of the Container App managed identity"
  value       = module.container_apps.managed_identity_principal_id
}

output "key_vault_access_policy_object_id" {
  description = "Object ID that has access to Key Vault"
  value       = module.key_vault.access_policy_object_id
}

# Environment-specific configuration
output "environment_config" {
  description = "Environment-specific configuration applied"
  value = {
    database_sku        = var.database_sku_name
    database_storage_mb = var.database_storage_mb
    redis_sku          = var.redis_sku_name
    redis_capacity     = var.redis_capacity
    min_replicas       = var.min_replicas
    max_replicas       = var.max_replicas
  }
}