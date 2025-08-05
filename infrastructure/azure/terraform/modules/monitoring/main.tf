# Monitoring module for CRM Azure infrastructure

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-${var.resource_prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = var.environment == "prod" ? 90 : 30

  tags = var.tags
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "appi-${var.resource_prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"

  # Disable telemetry collection for GDPR compliance
  disable_ip_masking = false

  tags = var.tags
}

# Action Group for alerts
resource "azurerm_monitor_action_group" "main" {
  name                = "ag-${var.resource_prefix}"
  resource_group_name = var.resource_group_name
  short_name          = "crm-alerts"

  # Email notifications
  dynamic "email_receiver" {
    for_each = var.alert_email_addresses
    content {
      name          = "email-${email_receiver.key}"
      email_address = email_receiver.value
    }
  }

  # Webhook for Slack/Teams integration
  dynamic "webhook_receiver" {
    for_each = var.webhook_url != "" ? [1] : []
    content {
      name                    = "webhook"
      service_uri            = var.webhook_url
      use_common_alert_schema = true
    }
  }

  tags = var.tags
}

# CPU Utilization Alert for Container App
resource "azurerm_monitor_metric_alert" "container_app_cpu" {
  count               = var.container_app_id != "" ? 1 : 0
  name                = "High CPU - Container App"
  resource_group_name = var.resource_group_name
  scopes              = [var.container_app_id]
  description         = "Alert when Container App CPU usage is high"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.App/containerApps"
    metric_name      = "CpuPercentage"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = var.tags
}

# Memory Utilization Alert for Container App
resource "azurerm_monitor_metric_alert" "container_app_memory" {
  count               = var.container_app_id != "" ? 1 : 0
  name                = "High Memory - Container App"
  resource_group_name = var.resource_group_name
  scopes              = [var.container_app_id]
  description         = "Alert when Container App memory usage is high"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.App/containerApps"
    metric_name      = "MemoryPercentage"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 85
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = var.tags
}

# Database Connection Alert
resource "azurerm_monitor_metric_alert" "database_connections" {
  count               = var.database_server_id != "" ? 1 : 0
  name                = "High Database Connections"
  resource_group_name = var.resource_group_name
  scopes              = [var.database_server_id]
  description         = "Alert when database connection count is high"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "active_connections"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = var.tags
}

# Redis Cache Memory Alert
resource "azurerm_monitor_metric_alert" "redis_memory" {
  count               = var.redis_cache_id != "" ? 1 : 0
  name                = "High Redis Memory Usage"
  resource_group_name = var.resource_group_name
  scopes              = [var.redis_cache_id]
  description         = "Alert when Redis memory usage is high"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.Cache/Redis"
    metric_name      = "usedmemorypercentage"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 90
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = var.tags
}

# Application Availability Alert
resource "azurerm_monitor_metric_alert" "app_availability" {
  count               = var.container_app_id != "" ? 1 : 0
  name                = "Low Application Availability"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Alert when application availability is low"
  severity            = 1
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Insights/components"
    metric_name      = "availabilityResults/availabilityPercentage"
    aggregation      = "Average"
    operator         = "LessThan"
    threshold        = 95
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = var.tags
}

# Dashboard
resource "azurerm_portal_dashboard" "main" {
  name                = "dashboard-${var.resource_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location

  dashboard_properties = templatefile("${path.module}/dashboard.json", {
    resource_group_name    = var.resource_group_name
    container_app_id       = var.container_app_id
    database_server_id     = var.database_server_id
    redis_cache_id         = var.redis_cache_id
    application_insights_id = azurerm_application_insights.main.id
    subscription_id        = data.azurerm_client_config.current.subscription_id
  })

  tags = var.tags
}

# Get current Azure client configuration
data "azurerm_client_config" "current" {}