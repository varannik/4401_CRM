# Key Vault module for CRM Azure infrastructure

# Get current Azure client configuration
data "azurerm_client_config" "current" {}

# Key Vault
resource "azurerm_key_vault" "main" {
  name                = "kv-${var.resource_prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = var.tenant_id
  sku_name            = "standard"

  # Security settings
  enabled_for_disk_encryption     = true
  enabled_for_deployment          = true
  enabled_for_template_deployment = true
  enable_rbac_authorization       = false  # Using access policies for simplicity
  purge_protection_enabled        = var.environment == "prod" ? true : false

  # Network access rules
  network_acls {
    bypass         = "AzureServices"
    default_action = "Allow"  # Change to "Deny" and add specific rules for production
  }

  tags = var.tags
}

# Access policy for current user/service principal
resource "azurerm_key_vault_access_policy" "deployer" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = var.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  secret_permissions = [
    "Get",
    "List",
    "Set",
    "Delete",
    "Recover",
    "Backup",
    "Restore",
    "Purge"
  ]

  key_permissions = [
    "Get",
    "List",
    "Create",
    "Delete",
    "Recover",
    "Backup",
    "Restore",
    "Purge"
  ]

  certificate_permissions = [
    "Get",
    "List",
    "Create",
    "Delete",
    "Recover",
    "Backup",
    "Restore",
    "Purge"
  ]
}

# Store application secrets
resource "azurerm_key_vault_secret" "secrets" {
  for_each = var.secrets

  name         = each.key
  value        = each.value
  key_vault_id = azurerm_key_vault.main.id

  tags = var.tags

  depends_on = [azurerm_key_vault_access_policy.deployer]
}

# Diagnostic settings for monitoring
resource "azurerm_monitor_diagnostic_setting" "key_vault" {
  count                      = var.log_analytics_workspace_id != null ? 1 : 0
  name                       = "keyvault-diagnostics"
  target_resource_id         = azurerm_key_vault.main.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log {
    category = "AuditEvent"
  }

  enabled_log {
    category = "AzurePolicyEvaluationDetails"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}