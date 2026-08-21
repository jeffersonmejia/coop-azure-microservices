module "apps_resource_group" {
  source = "./modules/resource-group"

  name     = var.apps_resource_group_name
  location = var.apps_location
}

module "database_resource_group" {
  source = "./modules/resource-group"

  name     = var.database_resource_group_name
  location = var.database_location
}

module "container_registry" {
  source = "./modules/container-registry"

  name                = local.names.acr
  resource_group_name = module.apps_resource_group.name
  location            = var.apps_location
  tags                = local.apps_tags
}

module "container_identity" {
  source = "./modules/managed-identity"

  name                  = local.names.identity
  resource_group_name   = module.apps_resource_group.name
  location              = var.apps_location
  container_registry_id = module.container_registry.id
  tags                  = local.apps_tags
}

module "observability" {
  source = "./modules/observability"

  resource_group_name       = module.apps_resource_group.name
  location                  = var.apps_location
  log_analytics_name        = local.names.log_analytics
  application_insights_name = local.names.application_insights
  action_group_name         = local.names.action_group
  tags                      = local.apps_tags
}

module "key_vault" {
  source = "./modules/key-vault"

  name                = local.names.key_vault
  resource_group_name = module.apps_resource_group.name
  location            = var.apps_location
  tenant_id           = var.tenant_id
  tags                = local.apps_tags
}

module "container_app_environment" {
  source = "./modules/container-app-environment"

  name                = local.names.container_app_environment
  resource_group_name = module.apps_resource_group.name
  location            = var.apps_location
  tags                = local.apps_tags
}

module "postgresql" {
  source = "./modules/postgresql"

  server_name            = local.names.postgres
  database_name          = local.names.database
  resource_group_name    = module.database_resource_group.name
  location               = var.database_location
  administrator_login    = var.postgres_administrator_login
  administrator_password = var.postgres_administrator_password
  tags                   = local.database_tags
}

module "auth_container_app" {
  source = "./modules/container-app"

  name                         = "ca-${var.project_name}-${var.environment_name}-auth"
  resource_group_name          = module.apps_resource_group.name
  container_app_environment_id = module.container_app_environment.id
  registry_server              = module.container_registry.login_server
  registry_identity_id         = module.container_identity.id
  image                        = var.container_images.auth
  target_port                  = 8081
  max_replicas                 = 3
  environment_variables        = merge(local.backend_common_environment, { SERVER_PORT = "8081" })
  secret_environment_variables = {
    SPRING_DATASOURCE_PASSWORD = {
      secret_name = "db-password"
      value       = var.postgres_administrator_password
    }
    JWT_SECRET = {
      secret_name = "jwt-secret"
      value       = var.jwt_secret
    }
  }
  health_probes_enabled = true
}

module "account_container_app" {
  source = "./modules/container-app"

  name                         = "ca-${var.project_name}-${var.environment_name}-account"
  resource_group_name          = module.apps_resource_group.name
  container_app_environment_id = module.container_app_environment.id
  registry_server              = module.container_registry.login_server
  registry_identity_id         = module.container_identity.id
  image                        = var.container_images.account
  target_port                  = 8082
  max_replicas                 = 3
  environment_variables        = merge(local.backend_common_environment, { SERVER_PORT = "8082" })
  secret_environment_variables = {
    SPRING_DATASOURCE_PASSWORD = {
      secret_name = "db-password"
      value       = var.postgres_administrator_password
    }
    JWT_SECRET = {
      secret_name = "jwt-secret"
      value       = var.jwt_secret
    }
  }
  health_probes_enabled = true
}

module "payment_container_app" {
  source = "./modules/container-app"

  name                         = "ca-${var.project_name}-${var.environment_name}-payment"
  resource_group_name          = module.apps_resource_group.name
  container_app_environment_id = module.container_app_environment.id
  registry_server              = module.container_registry.login_server
  registry_identity_id         = module.container_identity.id
  image                        = var.container_images.payment
  target_port                  = 8083
  max_replicas                 = 3
  environment_variables = merge(local.backend_common_environment, {
    SERVER_PORT         = "8083"
    ACCOUNT_SERVICE_URL = "https://${module.account_container_app.fqdn}"
  })
  secret_environment_variables = {
    SPRING_DATASOURCE_PASSWORD = {
      secret_name = "db-password"
      value       = var.postgres_administrator_password
    }
    JWT_SECRET = {
      secret_name = "jwt-secret"
      value       = var.jwt_secret
    }
  }
  health_probes_enabled = true
}

module "frontend_container_app" {
  source = "./modules/container-app"

  name                         = "ca-${var.project_name}-${var.environment_name}-frontend"
  resource_group_name          = module.apps_resource_group.name
  container_app_environment_id = module.container_app_environment.id
  registry_server              = module.container_registry.login_server
  registry_identity_id         = module.container_identity.id
  image                        = var.container_images.frontend
  target_port                  = 4200
  max_replicas                 = 2
  environment_variables = {
    NG_ALLOWED_HOSTS = "ca-${var.project_name}-${var.environment_name}-frontend.calmocean-039ebd3e.${var.apps_location}.azurecontainerapps.io"
  }
}

module "github_oidc" {
  source = "./modules/github-oidc"

  display_name        = var.github_application_display_name
  subscription_id     = var.subscription_id
  oidc_subject_prefix = var.github_oidc_subject_prefix
}
