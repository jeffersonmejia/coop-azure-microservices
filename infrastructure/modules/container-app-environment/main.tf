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

resource "azurerm_container_app_environment" "this" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location
  mutual_tls_enabled  = false
  tags                = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

output "id" {
  value = azurerm_container_app_environment.this.id
}

output "default_domain" {
  value = azurerm_container_app_environment.this.default_domain
}
