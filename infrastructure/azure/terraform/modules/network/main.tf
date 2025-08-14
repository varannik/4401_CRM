# Network module for CRM Azure infrastructure

# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "vnet-${var.resource_prefix}"
  address_space       = var.vnet_address_space
  location            = var.location
  resource_group_name = var.resource_group_name

  tags = var.tags
}

# Container Apps subnet
resource "azurerm_subnet" "container_apps" {
  name                 = "snet-container-apps"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = var.container_apps_subnet_address

  # Delegation removed - Azure Container Apps Environment will handle delegation automatically
}

# Database subnet
resource "azurerm_subnet" "database" {
  name                 = "snet-database"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = var.database_subnet_address

  service_endpoints = ["Microsoft.Storage"]
  
  delegation {
    name = "database-delegation"
    service_delegation {
      name    = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

# Redis subnet
resource "azurerm_subnet" "redis" {
  name                 = "snet-redis"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = var.redis_subnet_address
}

# Private DNS zone for PostgreSQL
resource "azurerm_private_dns_zone" "database" {
  name                = "${var.resource_prefix}.postgres.database.azure.com"
  resource_group_name = var.resource_group_name

  tags = var.tags
}

# Private DNS zone virtual network link
resource "azurerm_private_dns_zone_virtual_network_link" "database" {
  name                  = "database-dns-link"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.database.name
  virtual_network_id    = azurerm_virtual_network.main.id

  tags = var.tags
}

# Network Security Group for Container Apps subnet
resource "azurerm_network_security_group" "container_apps" {
  name                = "nsg-container-apps-${var.resource_prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name

  # Allow HTTPS inbound
  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Allow HTTP inbound (for health checks)
  security_rule {
    name                       = "AllowHTTP"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Allow Container Apps internal communication
  security_rule {
    name                       = "AllowContainerAppsInternal"
    priority                   = 1003
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = var.container_apps_subnet_address[0]
    destination_address_prefix = "*"
  }

  tags = var.tags
}

# Associate NSG with Container Apps subnet
resource "azurerm_subnet_network_security_group_association" "container_apps" {
  subnet_id                 = azurerm_subnet.container_apps.id
  network_security_group_id = azurerm_network_security_group.container_apps.id
}

# Network Security Group for Database subnet
resource "azurerm_network_security_group" "database" {
  name                = "nsg-database-${var.resource_prefix}"
  location            = var.location
  resource_group_name = var.resource_group_name

  # Allow PostgreSQL from Container Apps subnet
  security_rule {
    name                       = "AllowPostgreSQL"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5432"
    source_address_prefix      = var.container_apps_subnet_address[0]
    destination_address_prefix = "*"
  }

  tags = var.tags
}

# Associate NSG with Database subnet
resource "azurerm_subnet_network_security_group_association" "database" {
  subnet_id                 = azurerm_subnet.database.id
  network_security_group_id = azurerm_network_security_group.database.id
}