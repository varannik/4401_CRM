# Outputs for network module

output "virtual_network_id" {
  description = "ID of the virtual network"
  value       = azurerm_virtual_network.main.id
}

output "virtual_network_name" {
  description = "Name of the virtual network"
  value       = azurerm_virtual_network.main.name
}

output "container_apps_subnet_id" {
  description = "ID of the Container Apps subnet"
  value       = azurerm_subnet.container_apps.id
}

output "database_subnet_id" {
  description = "ID of the database subnet"
  value       = azurerm_subnet.database.id
}

output "redis_subnet_id" {
  description = "ID of the Redis subnet"
  value       = azurerm_subnet.redis.id
}

output "database_private_dns_zone_id" {
  description = "ID of the database private DNS zone"
  value       = azurerm_private_dns_zone.database.id
}

output "database_private_dns_zone_name" {
  description = "Name of the database private DNS zone"
  value       = azurerm_private_dns_zone.database.name
}