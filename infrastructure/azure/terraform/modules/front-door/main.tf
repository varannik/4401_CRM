# Front Door module for CRM Azure infrastructure

# Front Door Profile
resource "azurerm_cdn_frontdoor_profile" "main" {
  name                = "fd-${var.resource_prefix}"
  resource_group_name = var.resource_group_name
  sku_name            = var.sku_name

  tags = var.tags
}

# Front Door Endpoint
resource "azurerm_cdn_frontdoor_endpoint" "main" {
  name                     = "crm-${var.environment}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.main.id

  tags = var.tags
}

# Origin Group
resource "azurerm_cdn_frontdoor_origin_group" "main" {
  name                     = "crm-origin-group"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.main.id

  load_balancing {
    sample_size                 = 4
    successful_samples_required = 2
    additional_latency_in_milliseconds = 50
  }

  health_probe {
    interval_in_seconds = 240
    path                = "/api/health"
    protocol            = "Https"
    request_type        = "GET"
  }
}

# Origin
resource "azurerm_cdn_frontdoor_origin" "main" {
  name                          = "crm-origin"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.main.id
  enabled                       = true

  certificate_name_check_enabled = true
  host_name                     = var.backend_address
  http_port                     = 80
  https_port                    = 443
  origin_host_header            = var.backend_address
  priority                      = 1
  weight                        = 1000
}

# Route
resource "azurerm_cdn_frontdoor_route" "main" {
  name                          = "crm-route"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.main.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.main.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.main.id]

  supported_protocols    = ["Http", "Https"]
  patterns_to_match     = ["/*"]
  forwarding_protocol   = "HttpsOnly"
  link_to_default_domain = true
  https_redirect_enabled = true

  cache {
    query_string_caching_behavior = "IgnoreSpecifiedQueryStrings"
    query_strings                 = []
    compression_enabled           = true
    content_types_to_compress = [
      "application/eot",
      "application/font",
      "application/font-sfnt",
      "application/javascript",
      "application/json",
      "application/opentype",
      "application/otf",
      "application/pkcs7-mime",
      "application/truetype",
      "application/ttf",
      "application/vnd.ms-fontobject",
      "application/xhtml+xml",
      "application/xml",
      "application/xml+rss",
      "application/x-font-opentype",
      "application/x-font-truetype",
      "application/x-font-ttf",
      "application/x-httpd-cgi",
      "application/x-javascript",
      "application/x-mpegurl",
      "application/x-opentype",
      "application/x-otf",
      "application/x-perl",
      "application/x-ttf",
      "font/eot",
      "font/ttf",
      "font/otf",
      "font/opentype",
      "image/svg+xml",
      "text/css",
      "text/csv",
      "text/html",
      "text/javascript",
      "text/js",
      "text/plain",
      "text/richtext",
      "text/tab-separated-values",
      "text/xml",
      "text/x-script",
      "text/x-component",
      "text/x-java-source"
    ]
  }
}

# WAF Policy
resource "azurerm_cdn_frontdoor_firewall_policy" "main" {
  name                              = "waf${replace(var.resource_prefix, "-", "")}"
  resource_group_name               = var.resource_group_name
  sku_name                         = azurerm_cdn_frontdoor_profile.main.sku_name
  enabled                          = true
  mode                             = var.environment == "prod" ? "Prevention" : "Detection"
  redirect_url                     = "https://${azurerm_cdn_frontdoor_endpoint.main.host_name}/blocked"
  custom_block_response_status_code = 403
  custom_block_response_body        = base64encode("Access denied by WAF policy")

  # OWASP CRS Managed Rule Set
  managed_rule {
    type    = "Microsoft_DefaultRuleSet"
    version = "2.1"
    action  = "Block"

    # Override specific rules if needed
    override {
      rule_group_name = "PHP"
      rule {
        rule_id = "933100"
        enabled = false
        action  = "Log"
      }
    }
  }

  # Rate limiting rule
  custom_rule {
    name                           = "RateLimitRule"
    enabled                        = true
    priority                       = 1
    rate_limit_duration_in_minutes = 1
    rate_limit_threshold           = 100
    type                          = "RateLimitRule"
    action                        = "Block"

    match_condition {
      match_variable     = "RemoteAddr"
      operator          = "IPMatch"
      negation_condition = false
      match_values      = ["0.0.0.0/0"]
    }
  }

  tags = var.tags
}

# Security Policy
resource "azurerm_cdn_frontdoor_security_policy" "main" {
  name                     = "security-policy"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.main.id

  security_policies {
    firewall {
      cdn_frontdoor_firewall_policy_id = azurerm_cdn_frontdoor_firewall_policy.main.id

      association {
        domain {
          cdn_frontdoor_domain_id = azurerm_cdn_frontdoor_endpoint.main.id
        }
        patterns_to_match = ["/*"]
      }
    }
  }
}

# Custom Domain (if provided)
resource "azurerm_cdn_frontdoor_custom_domain" "main" {
  count                    = var.custom_domain != "" ? 1 : 0
  name                     = "custom-domain"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.main.id
  dns_zone_id             = var.dns_zone_id
  host_name               = var.custom_domain

  tls {
    certificate_type    = "ManagedCertificate"
    minimum_tls_version = "TLS12"
  }
}

# Custom Domain Route (if custom domain is used)
resource "azurerm_cdn_frontdoor_route" "custom_domain" {
  count                         = var.custom_domain != "" ? 1 : 0
  name                          = "custom-domain-route"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.main.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.main.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.main.id]

  cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.main[0].id]
  link_to_default_domain          = false

  supported_protocols    = ["Https"]
  patterns_to_match     = ["/*"]
  forwarding_protocol   = "HttpsOnly"
  https_redirect_enabled = true

  cache {
    query_string_caching_behavior = "IgnoreSpecifiedQueryStrings"
    compression_enabled           = true
  }
}