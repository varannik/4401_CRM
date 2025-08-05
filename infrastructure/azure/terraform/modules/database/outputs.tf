# Outputs for database module

output "server_id" {
  description = "ID of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.id
}

output "server_name" {
  description = "Name of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.name
}

output "server_fqdn" {
  description = "FQDN of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "database_name" {
  description = "Name of the PostgreSQL database"
  value       = azurerm_postgresql_flexible_server_database.main.name
}

output "connection_string" {
  description = "Connection string for the PostgreSQL database"
  value       = "postgresql://${var.administrator_login}:${local.admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${var.database_name}?sslmode=require"
  sensitive   = true
}

output "administrator_login" {
  description = "Administrator username"
  value       = var.administrator_login
}

output "server_version" {
  description = "PostgreSQL server version"
  value       = azurerm_postgresql_flexible_server.main.version
}