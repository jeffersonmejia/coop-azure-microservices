output "frontend_url" {
  description = "Public frontend URL."
  value       = "https://${module.frontend_container_app.fqdn}"
}

output "service_urls" {
  description = "Public URLs of the backend services."
  value = {
    auth    = "https://${module.auth_container_app.fqdn}"
    account = "https://${module.account_container_app.fqdn}"
    payment = "https://${module.payment_container_app.fqdn}"
  }
}

output "container_registry_login_server" {
  value = module.container_registry.login_server
}

output "github_actions_client_id" {
  description = "Client ID used by GitHub Actions OIDC login."
  value       = module.github_oidc.client_id
}

output "postgresql_fqdn" {
  value = module.postgresql.fqdn
}
