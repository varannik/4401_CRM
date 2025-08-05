# Outputs for front door module

output "front_door_profile_id" {
  description = "ID of the Front Door profile"
  value       = azurerm_cdn_frontdoor_profile.main.id
}

output "front_door_name" {
  description = "Name of the Front Door profile"
  value       = azurerm_cdn_frontdoor_profile.main.name
}

output "endpoint_id" {
  description = "ID of the Front Door endpoint"
  value       = azurerm_cdn_frontdoor_endpoint.main.id
}

output "endpoint_hostname" {
  description = "Hostname of the Front Door endpoint"
  value       = azurerm_cdn_frontdoor_endpoint.main.host_name
}

output "custom_domain_hostname" {
  description = "Custom domain hostname (if configured)"
  value       = var.custom_domain != "" ? var.custom_domain : null
}

output "waf_policy_id" {
  description = "ID of the WAF policy"
  value       = azurerm_cdn_frontdoor_firewall_policy.main.id
}