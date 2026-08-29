variable "name" {
  description = "Name of the Service Bus namespace."
  type        = string
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "principal_id" {
  description = "Managed identity principal allowed to send and receive messages."
  type        = string
}

variable "tags" {
  type = map(string)
}

resource "azurerm_servicebus_namespace" "this" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "Standard"

  # Workloads authenticate with the assigned managed identity and Azure RBAC.
  local_auth_enabled            = false
  public_network_access_enabled = true
  minimum_tls_version           = "1.2"
  tags                          = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_servicebus_queue" "payment_requests" {
  name         = "payment-requests"
  namespace_id = azurerm_servicebus_namespace.this.id

  lock_duration                           = "PT1M"
  max_delivery_count                      = 10
  default_message_ttl                     = "P14D"
  dead_lettering_on_message_expiration    = true
  requires_duplicate_detection            = true
  duplicate_detection_history_time_window = "PT10M"

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_servicebus_queue" "payment_results" {
  name         = "payment-results"
  namespace_id = azurerm_servicebus_namespace.this.id

  lock_duration                        = "PT1M"
  max_delivery_count                   = 10
  default_message_ttl                  = "P14D"
  dead_lettering_on_message_expiration = true

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_role_assignment" "sender" {
  scope                = azurerm_servicebus_namespace.this.id
  role_definition_name = "Azure Service Bus Data Sender"
  principal_id         = var.principal_id
}

resource "azurerm_role_assignment" "receiver" {
  scope                = azurerm_servicebus_namespace.this.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = var.principal_id
}

output "id" {
  value = azurerm_servicebus_namespace.this.id
}

output "fully_qualified_namespace" {
  value = "${azurerm_servicebus_namespace.this.name}.servicebus.windows.net"
}

output "payment_requests_queue_name" {
  value = azurerm_servicebus_queue.payment_requests.name
}

output "payment_results_queue_name" {
  value = azurerm_servicebus_queue.payment_results.name
}
