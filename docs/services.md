# Servicios, API y seguridad

## Aplicaciones

| Aplicación | Responsabilidad | Puerto local |
|---|---|---:|
| `frontend` | Angular SSR, interfaz y proxy `/api/*` | 4200 |
| `auth-service` | Registro, login, usuarios y JWT | 8081 |
| `account-service` | Cuentas, saldo, transferencias e historial | 8082 |
| `payment-service` | Pagos simulados y solicitud de débito | 8083 |

## Endpoints principales

- Autenticación: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
- Cuentas: `/api/accounts/me`, `/api/accounts/me/transactions`, `/api/accounts/transfer`.
- Pagos: `/api/payments`.
- Comunicación interna: `payment-service` usa `/api/accounts/debit`.

Cada backend publica Swagger UI en `http://localhost:{puerto}/swagger-ui.html` y OpenAPI en `/v3/api-docs`.

## Seguridad

- Spring Security valida JWT y roles `USER`/`ADMIN`.
- BCrypt protege las contraseñas de usuarios.
- El JWT se propaga de `payment-service` a `account-service`.
- Azure Container Apps proporciona HTTPS en el entorno desplegado.
- Las credenciales de infraestructura se suministran como variables sensibles y no se versionan.

Este MVP no incluye controles regulatorios ni autenticación reforzada; ver [fuera del alcance](out-of-scope.md).
