# Outputs for key vault module

output "key_vault_id" {
  description = "ID of the Key Vault"
  value       = azurerm_key_vault.main.id
}

output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

output "secret_uris" {
  description = "URIs of the secrets stored in Key Vault (keyed by secret name)"
  value = {
    for idx, s in local.secrets_list :
    s.name => azurerm_key_vault_secret.secrets[idx].versionless_id
  }
}

output "access_policy_object_id" {
  description = "Object ID that has access to Key Vault"
  value       = data.azurerm_client_config.current.object_id
}