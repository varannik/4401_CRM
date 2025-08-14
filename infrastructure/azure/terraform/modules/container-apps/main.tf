# Container Apps module for CRM Azure infrastructure

# Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${var.resource_prefix}"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  log_analytics_workspace_id = var.log_analytics_workspace_id
  infrastructure_subnet_id   = var.subnet_id

  tags = var.tags
}

# User Assigned Managed Identity for Container App
resource "azurerm_user_assigned_identity" "container_app" {
  name                = "id-${var.resource_prefix}-app"
  location            = var.location
  resource_group_name = var.resource_group_name

  tags = var.tags
}

# Key Vault access policy for managed identity
resource "azurerm_key_vault_access_policy" "container_app" {
  key_vault_id = var.key_vault_id
  tenant_id    = azurerm_user_assigned_identity.container_app.tenant_id
  object_id    = azurerm_user_assigned_identity.container_app.principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

# Container App
resource "azurerm_container_app" "main" {
  name                         = "ca-${var.resource_prefix}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_app.id]
  }

  # Registry configuration
  dynamic "registry" {
    for_each = var.container_registry_server != "" ? [1] : []
    content {
      server               = var.container_registry_server
      username             = var.container_registry_username
      password_secret_name = "registry-password"
    }
  }

  # Secrets configuration
  secret {
    name  = "registry-password"
    value = var.container_registry_password
  }

  dynamic "secret" {
    for_each = var.key_vault_secrets
    content {
      name                = secret.key
      key_vault_secret_id = secret.value
      identity            = azurerm_user_assigned_identity.container_app.id
    }
  }

  secret {
    name  = "database-url"
    value = var.database_url
  }

  secret {
    name  = "redis-connection-string"
    value = var.redis_connection_string
  }

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = "crm-app"
      image  = "${var.container_registry_server}/${var.container_image}"
      cpu    = var.cpu_requests
      memory = var.memory_requests

      # Environment variables
      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = tostring(var.container_port)
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name        = "REDIS_URL"
        secret_name = "redis-connection-string"
      }

      env {
        name  = "NEXTAUTH_URL"
        value = var.nextauth_url
      }

      # Azure AD configuration from Key Vault (using compliant secret names)
      env {
        name        = "AZURE_AD_CLIENT_ID"
        secret_name = "azure-ad-client-id"
      }

      env {
        name        = "AZURE_AD_CLIENT_SECRET"
        secret_name = "azure-ad-client-secret"
      }

      env {
        name        = "AZURE_AD_TENANT_ID"
        secret_name = "azure-ad-tenant-id"
      }

      env {
        name        = "NEXTAUTH_SECRET"
        secret_name = "nextauth-secret"
      }

      env {
        name        = "EMAIL_WEBHOOK_SECRET"
        secret_name = "email-webhook-secret"
      }

      # Health probes (use minimal fields supported by current provider)
      liveness_probe {
        transport = "HTTP"
        port      = var.container_port
        path      = "/api/health"
      }

      readiness_probe {
        transport = "HTTP"
        port      = var.container_port
        path      = "/api/health"
      }
    }

    # HTTP scaling rule
    http_scale_rule {
      name                = "http-scale"
      concurrent_requests = 100
    }

    # (Removed) azure_queue_scale_rule requires authentication block in newer providers
  }

  # Ingress configuration
  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = var.container_port
    transport                  = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = var.tags

  depends_on = [
    azurerm_key_vault_access_policy.container_app
  ]
}