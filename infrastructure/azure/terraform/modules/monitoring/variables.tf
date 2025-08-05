# Variables for monitoring module

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
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

variable "container_app_id" {
  description = "ID of the Container App to monitor"
  type        = string
  default     = ""
}

variable "database_server_id" {
  description = "ID of the database server to monitor"
  type        = string
  default     = ""
}

variable "redis_cache_id" {
  description = "ID of the Redis cache to monitor"
  type        = string
  default     = ""
}

variable "alert_email_addresses" {
  description = "List of email addresses for alerts"
  type        = list(string)
  default     = []
}

variable "webhook_url" {
  description = "Webhook URL for notifications (Slack, Teams, etc.)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}