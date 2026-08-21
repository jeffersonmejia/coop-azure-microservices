variable "subscription_id" {
  description = "Azure subscription that contains the existing Coop EC resources."
  type        = string
}

variable "tenant_id" {
  description = "Microsoft Entra tenant that contains the GitHub Actions application."
  type        = string
}

variable "project_name" {
  description = "Short project identifier used in resource names."
  type        = string
  default     = "coop"
}

variable "environment_name" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "apps_resource_group_name" {
  description = "Resource group for Container Apps and shared application services."
  type        = string
  default     = "rg-coop-scus-dev"
}

variable "apps_location" {
  description = "Azure region for application resources."
  type        = string
  default     = "southcentralus"
}

variable "database_resource_group_name" {
  description = "Resource group for PostgreSQL."
  type        = string
  default     = "rg-coop-db-brazil"
}

variable "database_location" {
  description = "Azure region for PostgreSQL."
  type        = string
  default     = "brazilsouth"
}

variable "postgres_administrator_login" {
  description = "Administrator login of the existing PostgreSQL server."
  type        = string
  default     = "coopadmin"
}

variable "postgres_administrator_password" {
  description = "PostgreSQL administrator password. Supply with TF_VAR_postgres_administrator_password; never commit it."
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret for the backend Container Apps. Supply with TF_VAR_jwt_secret; never commit it."
  type        = string
  sensitive   = true
}

variable "container_images" {
  description = "Bootstrap images for Container Apps. CI owns subsequent image-tag changes."
  type = object({
    auth     = string
    account  = string
    payment  = string
    frontend = string
  })
}

variable "github_application_display_name" {
  description = "Display name of the existing GitHub Actions Microsoft Entra application."
  type        = string
  default     = "sp-coop-dev-github-actions"
}

variable "github_oidc_subject_prefix" {
  description = "Repository prefix emitted by the repository's GitHub OIDC subject customization."
  type        = string
  default     = "repo:jeffersonmejia@67712790/coop-azure-microservices@1336450200"
}
