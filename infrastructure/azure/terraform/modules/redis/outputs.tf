# Outputs for redis module

output "redis_id" {
  description = "ID of the Redis cache"
  value       = azurerm_redis_cache.main.id
}

output "redis_name" {
  description = "Name of the Redis cache"
  value       = azurerm_redis_cache.main.name
}

output "redis_hostname" {
  description = "Hostname of the Redis cache"
  value       = azurerm_redis_cache.main.hostname
}

output "redis_port" {
  description = "Port of the Redis cache"
  value       = azurerm_redis_cache.main.port
}

output "redis_ssl_port" {
  description = "SSL port of the Redis cache"
  value       = azurerm_redis_cache.main.ssl_port
}

output "connection_string" {
  description = "Connection string for Redis cache"
  value       = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port}/0"
  sensitive   = true
}

output "primary_access_key" {
  description = "Primary access key for Redis cache"
  value       = azurerm_redis_cache.main.primary_access_key
  sensitive   = true
}