variable "name" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "tenant_id" {
  type = string
}

variable "tags" {
  type = map(string)
}

resource "azurerm_key_vault" "this" {
  name                            = var.name
  resource_group_name             = var.resource_group_name
  location                        = var.location
  tenant_id                       = var.tenant_id
  sku_name                        = "standard"
  rbac_authorization_enabled      = true
  enabled_for_deployment          = false
  enabled_for_disk_encryption     = false
  enabled_for_template_deployment = false
  purge_protection_enabled        = true
  public_network_access_enabled   = true
  soft_delete_retention_days      = 90
  tags                            = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

output "id" {
  value = azurerm_key_vault.this.id
}

output "vault_uri" {
  value = azurerm_key_vault.this.vault_uri
}
