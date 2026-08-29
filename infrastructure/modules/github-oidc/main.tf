variable "display_name" {
  type = string
}

variable "subscription_id" {
  type = string
}

variable "oidc_subject_prefix" {
  type = string
}

resource "azuread_application" "this" {
  display_name     = var.display_name
  sign_in_audience = "AzureADMyOrg"

  lifecycle {
    prevent_destroy = true
  }
}

resource "azuread_service_principal" "this" {
  client_id                    = azuread_application.this.client_id
  account_enabled              = true
  app_role_assignment_required = false

  lifecycle {
    prevent_destroy = true
  }
}

resource "azuread_application_federated_identity_credential" "main" {
  application_id = azuread_application.this.id
  display_name   = "github-main-ref-correct"
  description    = "GitHub Actions OIDC for the main branch"
  audiences      = ["api://AzureADTokenExchange"]
  issuer         = "https://token.actions.githubusercontent.com"
  subject        = "${var.oidc_subject_prefix}:ref:refs/heads/main"

  lifecycle {
    prevent_destroy = true
  }
}

resource "azuread_application_federated_identity_credential" "staging" {
  application_id = azuread_application.this.id
  display_name   = "github-staging-env"
  description    = "GitHub Actions OIDC for the staging environment"
  audiences      = ["api://AzureADTokenExchange"]
  issuer         = "https://token.actions.githubusercontent.com"
  subject        = "${var.oidc_subject_prefix}:environment:staging"

  lifecycle {
    prevent_destroy = true
  }
}

resource "azuread_application_federated_identity_credential" "production" {
  application_id = azuread_application.this.id
  display_name   = "github-production-env"
  description    = "GitHub Actions OIDC for the production environment"
  audiences      = ["api://AzureADTokenExchange"]
  issuer         = "https://token.actions.githubusercontent.com"
  subject        = "${var.oidc_subject_prefix}:environment:production"

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_role_assignment" "contributor" {
  scope                = "/subscriptions/${var.subscription_id}"
  role_definition_name = "Contributor"
  principal_id         = azuread_service_principal.this.object_id

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_role_assignment" "acr_push" {
  scope                = "/subscriptions/${var.subscription_id}"
  role_definition_name = "AcrPush"
  principal_id         = azuread_service_principal.this.object_id

  lifecycle {
    prevent_destroy = true
  }
}

output "client_id" {
  value = azuread_application.this.client_id
}

output "object_id" {
  value = azuread_service_principal.this.object_id
}
