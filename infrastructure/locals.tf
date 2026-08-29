locals {
  names = {
    acr                       = "acr${var.project_name}${var.environment_name}"
    identity                  = "id-${var.project_name}-${var.environment_name}-acr-pull"
    log_analytics             = "law-${var.project_name}-${var.environment_name}"
    application_insights      = "appi-${var.project_name}-${var.environment_name}"
    action_group              = "Application Insights Smart Detection"
    key_vault                 = "kv${var.project_name}${var.environment_name}-scus"
    container_app_environment = "cae-${var.project_name}-${var.environment_name}"
    postgres                  = "psql-${var.project_name}-${var.environment_name}"
    database                  = "coop"
    service_bus               = "sb-${var.project_name}-${var.environment_name}-${substr(var.subscription_id, 0, 8)}"
  }

  apps_tags = {
    environment = var.environment_name
    project     = var.project_name
    region      = var.apps_location
    managedBy   = "terraform"
  }

  database_tags = {
    environment = var.environment_name
    project     = var.project_name
    region      = var.database_location
    managedBy   = "terraform"
  }

  database_url = "jdbc:postgresql://${local.names.postgres}.postgres.database.azure.com:5432/${local.names.database}?sslmode=require"

  backend_common_environment = {
    SPRING_DATASOURCE_URL      = local.database_url
    SPRING_DATASOURCE_USERNAME = var.postgres_administrator_login
  }
}
