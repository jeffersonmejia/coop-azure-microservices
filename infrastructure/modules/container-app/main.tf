variable "name" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "container_app_environment_id" {
  type = string
}

variable "registry_server" {
  type = string
}

variable "registry_identity_id" {
  type = string
}

variable "image" {
  type = string
}

variable "target_port" {
  type = number
}

variable "min_replicas" {
  type    = number
  default = 1
}

variable "max_replicas" {
  type = number
}

variable "cpu" {
  type    = number
  default = 0.5
}

variable "memory" {
  type    = string
  default = "1Gi"
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}

variable "secret_environment_variables" {
  type = map(object({
    secret_name = string
    value       = string
  }))
  sensitive = true
  default   = {}
}

variable "health_probes_enabled" {
  type    = bool
  default = false
}

resource "azurerm_container_app" "this" {
  name                         = var.name
  resource_group_name          = var.resource_group_name
  container_app_environment_id = var.container_app_environment_id
  revision_mode                = "Single"
  max_inactive_revisions       = 100

  identity {
    type         = "UserAssigned"
    identity_ids = [var.registry_identity_id]
  }

  registry {
    server   = var.registry_server
    identity = var.registry_identity_id
  }

  dynamic "secret" {
    for_each = var.secret_environment_variables
    content {
      name  = secret.value.secret_name
      value = secret.value.value
    }
  }

  ingress {
    external_enabled = true
    target_port      = var.target_port
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = var.name
      image  = var.image
      cpu    = var.cpu
      memory = var.memory

      dynamic "env" {
        for_each = var.environment_variables
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = var.secret_environment_variables
        content {
          name        = env.key
          secret_name = env.value.secret_name
        }
      }

      dynamic "liveness_probe" {
        for_each = var.health_probes_enabled ? [1] : []
        content {
          transport               = "TCP"
          port                    = var.target_port
          initial_delay           = 60
          interval_seconds        = 30
          timeout                 = 5
          failure_count_threshold = 3
        }
      }

      dynamic "readiness_probe" {
        for_each = var.health_probes_enabled ? [1] : []
        content {
          transport               = "HTTP"
          port                    = var.target_port
          path                    = "/actuator/health"
          initial_delay           = 60
          interval_seconds        = 30
          timeout                 = 10
          failure_count_threshold = 3
          success_count_threshold = 1
        }
      }

      dynamic "startup_probe" {
        for_each = var.health_probes_enabled ? [1] : []
        content {
          transport               = "TCP"
          port                    = var.target_port
          initial_delay           = 10
          interval_seconds        = 30
          timeout                 = 5
          failure_count_threshold = 10
        }
      }
    }
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [template[0].container[0].image]
  }
}

output "id" {
  value = azurerm_container_app.this.id
}

output "fqdn" {
  value = azurerm_container_app.this.ingress[0].fqdn
}
