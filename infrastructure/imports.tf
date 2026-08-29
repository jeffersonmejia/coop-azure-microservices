# These import blocks adopt the already-deployed dev resources on the first
# `terraform apply`. They do not create replacement resources. Every managed
# Azure resource also has prevent_destroy enabled.

import {
  to = module.apps_resource_group.azurerm_resource_group.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}"
}

import {
  to = module.database_resource_group.azurerm_resource_group.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.database_resource_group_name}"
}

import {
  to = module.container_registry.azurerm_container_registry.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.ContainerRegistry/registries/acrcoopdev"
}

import {
  to = module.container_identity.azurerm_user_assigned_identity.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/id-coop-dev-acr-pull"
}

import {
  to = module.container_identity.azurerm_role_assignment.acr_pull
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.ContainerRegistry/registries/acrcoopdev/providers/Microsoft.Authorization/roleAssignments/970a0aac-5556-487a-ba7a-17f0c6e5e2b3"
}

import {
  to = module.observability.azurerm_log_analytics_workspace.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.OperationalInsights/workspaces/law-coop-dev"
}

import {
  to = module.observability.azurerm_application_insights.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.Insights/components/appi-coop-dev"
}

import {
  to = module.observability.azurerm_monitor_action_group.smart_detection
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.Insights/actionGroups/Application Insights Smart Detection"
}

import {
  to = module.key_vault.azurerm_key_vault.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.KeyVault/vaults/kvcoopdev-scus"
}

import {
  to = module.container_app_environment.azurerm_container_app_environment.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.App/managedEnvironments/cae-coop-dev"
}

import {
  to = module.auth_container_app.azurerm_container_app.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.App/containerApps/ca-coop-dev-auth"
}

import {
  to = module.account_container_app.azurerm_container_app.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.App/containerApps/ca-coop-dev-account"
}

import {
  to = module.payment_container_app.azurerm_container_app.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.App/containerApps/ca-coop-dev-payment"
}

import {
  to = module.frontend_container_app.azurerm_container_app.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.apps_resource_group_name}/providers/Microsoft.App/containerApps/ca-coop-dev-frontend"
}

import {
  to = module.postgresql.azurerm_postgresql_flexible_server.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.database_resource_group_name}/providers/Microsoft.DBforPostgreSQL/flexibleServers/psql-coop-dev"
}

import {
  to = module.postgresql.azurerm_postgresql_flexible_server_database.this
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.database_resource_group_name}/providers/Microsoft.DBforPostgreSQL/flexibleServers/psql-coop-dev/databases/coop"
}

import {
  to = module.postgresql.azurerm_postgresql_flexible_server_firewall_rule.azure_services
  id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.database_resource_group_name}/providers/Microsoft.DBforPostgreSQL/flexibleServers/psql-coop-dev/firewallRules/AllowAzureServices"
}

import {
  to = module.github_oidc.azuread_application.this
  id = "/applications/845a8ede-53be-46cf-931f-1a105c8ef28c"
}

import {
  to = module.github_oidc.azuread_service_principal.this
  id = "/servicePrincipals/c0fd3aa2-446d-4e43-bbcf-406b02899748"
}

import {
  to = module.github_oidc.azuread_application_federated_identity_credential.main
  id = "/applications/845a8ede-53be-46cf-931f-1a105c8ef28c/federatedIdentityCredentials/90f05d11-8516-4cbf-bb8c-cbaa725394c3"
}

import {
  to = module.github_oidc.azuread_application_federated_identity_credential.staging
  id = "/applications/845a8ede-53be-46cf-931f-1a105c8ef28c/federatedIdentityCredentials/e8b41669-9f7d-439b-9a43-a9af827e3d00"
}

import {
  to = module.github_oidc.azurerm_role_assignment.contributor
  id = "/subscriptions/${var.subscription_id}/providers/Microsoft.Authorization/roleAssignments/cfe68fc9-657f-448a-886d-d33e5be9ce7f"
}

import {
  to = module.github_oidc.azurerm_role_assignment.acr_push
  id = "/subscriptions/${var.subscription_id}/providers/Microsoft.Authorization/roleAssignments/7e2d2421-f264-49c5-af97-62ca455eee03"
}
