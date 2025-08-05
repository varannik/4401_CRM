# Container Registry module for CRM Azure infrastructure

# Azure Container Registry
resource "azurerm_container_registry" "main" {
  name                = "acr${replace(var.resource_prefix, "-", "")}"  # Remove hyphens for ACR name
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.sku
  admin_enabled       = true

  # Enable public network access (can be restricted later)
  public_network_access_enabled = true

  # Network rule set for security
  network_rule_set {
    default_action = "Allow"  # Change to "Deny" and add specific rules for production
  }

  # Enable content trust for image signing in higher SKUs
  dynamic "trust_policy" {
    for_each = var.sku == "Premium" ? [1] : []
    content {
      enabled = true
    }
  }

  # Retention policy for untagged manifests
  dynamic "retention_policy" {
    for_each = var.sku == "Premium" ? [1] : []
    content {
      days    = 7
      enabled = true
    }
    }

  # Enable vulnerability scanning for Premium SKU
  dynamic "quarantine_policy" {
    for_each = var.sku == "Premium" ? [1] : []
    content {
      enabled = true
    }
  }

  tags = var.tags
}

# Store ACR credentials in Key Vault if provided
resource "azurerm_key_vault_secret" "acr_username" {
  count        = var.key_vault_id != "" ? 1 : 0
  name         = "acr-username"
  value        = azurerm_container_registry.main.admin_username
  key_vault_id = var.key_vault_id

  tags = var.tags
}

resource "azurerm_key_vault_secret" "acr_password" {
  count        = var.key_vault_id != "" ? 1 : 0
  name         = "acr-password"
  value        = azurerm_container_registry.main.admin_password
  key_vault_id = var.key_vault_id

  tags = var.tags
}

# Diagnostic settings for monitoring
resource "azurerm_monitor_diagnostic_setting" "acr" {
  count                      = var.log_analytics_workspace_id != null ? 1 : 0
  name                       = "acr-diagnostics"
  target_resource_id         = azurerm_container_registry.main.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log {
    category = "ContainerRegistryRepositoryEvents"
  }

  enabled_log {
    category = "ContainerRegistryLoginEvents"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}