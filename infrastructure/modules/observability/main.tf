variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "log_analytics_name" {
  type = string
}

variable "application_insights_name" {
  type = string
}

variable "tags" {
  type = map(string)
}

resource "azurerm_log_analytics_workspace" "this" {
  name                       = var.log_analytics_name
  resource_group_name        = var.resource_group_name
  location                   = var.location
  sku                        = "PerGB2018"
  retention_in_days          = 30
  internet_ingestion_enabled = true
  internet_query_enabled     = true
  tags                       = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_application_insights" "this" {
  name                       = var.application_insights_name
  resource_group_name        = var.resource_group_name
  location                   = var.location
  workspace_id               = azurerm_log_analytics_workspace.this.id
  application_type           = "web"
  retention_in_days          = 90
  internet_ingestion_enabled = true
  internet_query_enabled     = true
  tags                       = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

output "log_analytics_workspace_id" {
  value = azurerm_log_analytics_workspace.this.id
}

output "application_insights_id" {
  value = azurerm_application_insights.this.id
}
