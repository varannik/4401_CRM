# Database module for CRM Azure infrastructure

# Random password for database admin if not provided
resource "random_password" "admin_password" {
  count   = var.administrator_password == "" ? 1 : 0
  length  = 16
  special = true
}

locals {
  admin_password = var.administrator_password != "" ? var.administrator_password : random_password.admin_password[0].result
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "psql-${var.resource_prefix}"
  resource_group_name    = var.resource_group_name
  location              = var.location
  version               = "15"
  public_network_access_enabled = true
  
  delegated_subnet_id    = var.subnet_id
  private_dns_zone_id    = var.private_dns_zone_id
  
  administrator_login    = var.administrator_login
  administrator_password = local.admin_password
  
  zone                  = "1"
  
  storage_mb            = var.storage_mb
  storage_tier          = "P4"
  
  sku_name              = var.sku_name
  
  backup_retention_days        = var.backup_retention_days
  geo_redundant_backup_enabled = var.environment == "prod" ? true : false
  
  auto_grow_enabled = true
  
  # High availability for production
  dynamic "high_availability" {
    for_each = var.environment == "prod" ? [1] : []
    content {
      mode                      = "ZoneRedundant"
      standby_availability_zone = "2"
    }
  }
  
  # Maintenance window
  maintenance_window {
    day_of_week  = 0  # Sunday
    start_hour   = 2  # 2 AM
    start_minute = 0
  }

  tags = var.tags

  depends_on = [var.private_dns_zone_id]
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# PostgreSQL Configuration for optimal performance
resource "azurerm_postgresql_flexible_server_configuration" "shared_preload_libraries" {
  name      = "shared_preload_libraries"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "pg_stat_statements"
}

resource "azurerm_postgresql_flexible_server_configuration" "log_statement" {
  name      = "log_statement"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "none"  # Don't log all statements in production
}

resource "azurerm_postgresql_flexible_server_configuration" "log_min_duration_statement" {
  name      = "log_min_duration_statement"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "1000"  # Log queries taking more than 1 second
}

# Store database credentials in Key Vault
resource "azurerm_key_vault_secret" "database_username" {
  name         = "database-username"
  value        = var.administrator_login
  key_vault_id = var.key_vault_id

  tags = var.tags
}

resource "azurerm_key_vault_secret" "database_password" {
  name         = "database-password"
  value        = local.admin_password
  key_vault_id = var.key_vault_id

  tags = var.tags
}

resource "azurerm_key_vault_secret" "database_connection_string" {
  name         = "database-connection-string"
  value        = "postgresql://${var.administrator_login}:${local.admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${var.database_name}?sslmode=require"
  key_vault_id = var.key_vault_id

  tags = var.tags
}

# Diagnostic settings for monitoring
resource "azurerm_monitor_diagnostic_setting" "database" {
  name                       = "database-diagnostics"
  target_resource_id         = azurerm_postgresql_flexible_server.main.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log {
    category = "PostgreSQLLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}