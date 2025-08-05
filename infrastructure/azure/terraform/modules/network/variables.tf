# Variables for network module

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

variable "vnet_address_space" {
  description = "Address space for the virtual network"
  type        = list(string)
}

variable "container_apps_subnet_address" {
  description = "Address space for Container Apps subnet"
  type        = list(string)
}

variable "database_subnet_address" {
  description = "Address space for database subnet"
  type        = list(string)
}

variable "redis_subnet_address" {
  description = "Address space for Redis subnet"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}