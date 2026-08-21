variable "name" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "tags" {
  type = map(string)
}

resource "azurerm_container_registry" "this" {
  name                          = var.name
  resource_group_name           = var.resource_group_name
  location                      = var.location
  sku                           = "Basic"
  admin_enabled                 = false
  anonymous_pull_enabled        = false
  data_endpoint_enabled         = false
  network_rule_bypass_option    = "AzureServices"
  public_network_access_enabled = true
  zone_redundancy_enabled       = false
  tags                          = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

output "id" {
  value = azurerm_container_registry.this.id
}

output "login_server" {
  value = azurerm_container_registry.this.login_server
}
