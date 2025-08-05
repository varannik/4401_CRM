# Outputs for container apps module

output "container_app_id" {
  description = "ID of the Container App"
  value       = azurerm_container_app.main.id
}

output "container_app_name" {
  description = "Name of the Container App"
  value       = azurerm_container_app.main.name
}

output "app_url" {
  description = "URL of the Container App"
  value       = "https://${azurerm_container_app.main.latest_revision_fqdn}"
}

output "app_fqdn" {
  description = "FQDN of the Container App"
  value       = azurerm_container_app.main.latest_revision_fqdn
}

output "container_app_environment_id" {
  description = "ID of the Container App Environment"
  value       = azurerm_container_app_environment.main.id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the managed identity"
  value       = azurerm_user_assigned_identity.container_app.principal_id
}

output "managed_identity_client_id" {
  description = "Client ID of the managed identity"
  value       = azurerm_user_assigned_identity.container_app.client_id
}