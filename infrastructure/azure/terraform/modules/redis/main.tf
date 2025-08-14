# Redis module for CRM Azure infrastructure

# Azure Redis Cache
resource "azurerm_redis_cache" "main" {
  name                = "redis-${var.resource_prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  capacity            = var.capacity
  family              = var.family
  sku_name            = var.sku_name
  enable_non_ssl_port = false  # Always use SSL
  minimum_tls_version = "1.2"

  # Subnet configuration for Premium SKU (use property directly when provided)
  subnet_id = var.sku_name == "Premium" ? var.subnet_id : null

  # Redis configuration
  redis_configuration {
    enable_authentication           = true
    maxmemory_reserved             = var.sku_name == "Premium" ? 50 : 2
    maxmemory_delta                = var.sku_name == "Premium" ? 50 : 2
    maxmemory_policy               = "allkeys-lru"
    notify_keyspace_events         = ""
    rdb_backup_enabled             = var.sku_name == "Premium" && var.environment == "prod" ? true : false
    rdb_backup_frequency           = var.sku_name == "Premium" && var.environment == "prod" ? 60 : null
    rdb_backup_max_snapshot_count  = var.sku_name == "Premium" && var.environment == "prod" ? 1 : null
    rdb_storage_connection_string  = var.sku_name == "Premium" && var.environment == "prod" ? var.backup_storage_connection_string : null
  }

  # (Removed) zones block not supported in this resource version

  # Private endpoint configuration for Premium SKU
  public_network_access_enabled = var.sku_name == "Premium" ? false : true

  tags = var.tags
}

# Store Redis credentials in Key Vault
resource "azurerm_key_vault_secret" "redis_connection_string" {
  name         = "redis-connection-string"
  value        = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port}/0"
  key_vault_id = var.key_vault_id

  tags = var.tags
}

resource "azurerm_key_vault_secret" "redis_primary_key" {
  name         = "redis-primary-key"
  value        = azurerm_redis_cache.main.primary_access_key
  key_vault_id = var.key_vault_id

  tags = var.tags
}

# Private endpoint for Premium SKU
resource "azurerm_private_endpoint" "redis" {
  count               = var.sku_name == "Premium" ? 1 : 0
  name                = "pe-redis-${var.resource_prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.subnet_id

  private_service_connection {
    name                           = "redis-private-connection"
    private_connection_resource_id = azurerm_redis_cache.main.id
    subresource_names              = ["redisCache"]
    is_manual_connection           = false
  }

  tags = var.tags
}

# Diagnostic settings for monitoring
resource "azurerm_monitor_diagnostic_setting" "redis" {
  count                      = var.log_analytics_workspace_id != null ? 1 : 0
  name                       = "redis-diagnostics"
  target_resource_id         = azurerm_redis_cache.main.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}