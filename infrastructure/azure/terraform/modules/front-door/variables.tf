# Variables for front door module

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "resource_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "backend_address" {
  description = "Backend address (hostname) for the origin"
  type        = string
}

variable "custom_domain" {
  description = "Custom domain for the application"
  type        = string
  default     = ""
}

variable "dns_zone_id" {
  description = "DNS zone ID for the custom domain"
  type        = string
  default     = ""
}

variable "sku_name" {
  description = "SKU name for Front Door"
  type        = string
  default     = "Standard_AzureFrontDoor"
  validation {
    condition     = contains(["Standard_AzureFrontDoor", "Premium_AzureFrontDoor"], var.sku_name)
    error_message = "SKU must be Standard_AzureFrontDoor or Premium_AzureFrontDoor."
  }
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}