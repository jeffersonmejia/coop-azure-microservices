variable "name" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "container_registry_id" {
  type = string
}

variable "tags" {
  type = map(string)
}

resource "azurerm_user_assigned_identity" "this" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = var.container_registry_id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.this.principal_id

  lifecycle {
    prevent_destroy = true
  }
}

output "id" {
  value = azurerm_user_assigned_identity.this.id
}

output "client_id" {
  value = azurerm_user_assigned_identity.this.client_id
}

output "principal_id" {
  value = azurerm_user_assigned_identity.this.principal_id
}
