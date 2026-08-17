# Criterio de Finalización del MVP

El MVP de Coop EC estará terminado cuando sea posible demostrar los siguientes 15 puntos:

---

## Flujo Completo

### Local

- [ ] 1. Registrar un socio
- [ ] 2. Iniciar sesión
- [ ] 3. Obtener JWT
- [ ] 4. Consultar su cuenta
- [ ] 5. Consultar saldo
- [ ] 6. Transferir saldo a otra cuenta
- [ ] 7. Registrar un pago solicitando el débito a account-service
- [ ] 8. Consultar historial
- [ ] 9. Ver la operación reflejada en PostgreSQL
- [ ] 10. Ejecutar todo localmente con Docker Compose
- [ ] 11. Construir imágenes Docker

### Azure

- [ ] 12. Provisionar infraestructura Azure con Bicep
- [ ] 13. Desplegar las cuatro aplicaciones en Azure
- [ ] 14. Acceder al frontend desplegado
- [ ] 15. Ejecutar el flujo completo sobre Azure

---

## Detalle de Cada Punto

### 1. Registrar un socio

- Endpoint: `POST /api/auth/register`
- Body: `{email, password, firstName, lastName}`
- Response: `201 Created`
- Cuenta creada automáticamente con saldo 1000.00 USD

### 2. Iniciar sesión

- Endpoint: `POST /api/auth/login`
- Body: `{email, password}`
- Response: `{token}`

### 3. Obtener JWT

- El token JWT se recibe en el paso 2
- Contiene claims: `sub` (email), `uid` (user ID), `role`
- Expiración configurable (default: 1 hora)

### 4. Consultar su cuenta

- Endpoint: `GET /api/accounts/me`
- Header: `Authorization: Bearer {token}`
- Response: `{id, accountNumber, balance, status}`
- Si la cuenta no existe, se crea automáticamente

### 5. Consultar saldo

- Endpoint: `GET /api/accounts/me`
- Response incluye `balance`
- Saldo inicial: 1000.00 USD

### 6. Transferir saldo a otra cuenta

- Endpoint: `POST /api/accounts/transfer`
- Header: `Authorization: Bearer {token}`
- Body: `{destinationAccountNumber, amount}`
- Response: `200 OK`
- Transferencia atómica (débito + crédito)
- Se crean dos transacciones: TRANSFER_OUT y TRANSFER_IN

### 7. Registrar un pago

- Endpoint: `POST /api/payments`
- Header: `Authorization: Bearer {token}`
- Body: `{accountNumber, amount, description, reference}`
- Response: `{id, status}` (PENDING → COMPLETED/FAILED)
- payment-service solicita débito a account-service vía HTTP

### 8. Consultar historial

- Endpoint: `GET /api/accounts/me/transactions?page=0&size=20`
- Header: `Authorization: Bearer {token}`
- Response: `{content: [...], totalPages, totalElements}`
- Paginación server-side

### 9. Ver la operación reflejada en PostgreSQL

- Conectar a PostgreSQL
- Verificar transacciones en `accounts.account_transactions`
- Verificar pagos en `payments.payments`
- Verificar saldo actualizado en `accounts.accounts`

### 10. Ejecutar todo localmente con Docker Compose

```bash
docker compose up
```

Servicios:
- Frontend: http://localhost:4200
- auth-service: http://localhost:8081
- account-service: http://localhost:8082
- payment-service: http://localhost:8083
- PostgreSQL: localhost:5432

### 11. Construir imágenes Docker

```bash
docker compose build
```

Cada servicio tiene su propio Dockerfile multi-stage.

### 12. Provisionar infraestructura Azure con Bicep

```bash
az login
az account set --subscription "tu-suscripción"
./scripts/deploy.sh
```

Recursos creados:
- `rg-coop-dev` — Resource Group
- `acrcoopdev` — Container Registry
- `cae-coop-dev` — Container Apps Environment
- `ca-coop-{service}-dev` — Container Apps
- `psql-coop-dev` — PostgreSQL
- `kv-coop-dev` — Key Vault

### 13. Desplegar las cuatro aplicaciones en Azure

El script `deploy.sh` ejecuta:
1. Validación Bicep
2. Creación de resource group
3. Despliegue de infraestructura
4. Build de imágenes Docker
5. Push a ACR
6. Reinicio de Container Apps

### 14. Acceder al frontend desplegado

- URL: `https://ca-coop-frontend-dev.{location}.azurecontainerapps.io`
- Login con credenciales creadas en el paso 1

### 15. Ejecutar el flujo completo sobre Azure

Repetir pasos 1-9 contra la versión desplegada en Azure.

---

## Comandos de Verificación

### Local

```bash
# Registrar socio
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@coop.com","password":"test123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@coop.com","password":"test123"}'

# Guardar token
TOKEN="eyJ..."

# Consultar cuenta
curl http://localhost:8082/api/accounts/me \
  -H "Authorization: Bearer $TOKEN"

# Transferir
curl -X POST http://localhost:8082/api/accounts/transfer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destinationAccountNumber":"COOP000002","amount":100.00}'

# Registrar pago
curl -X POST http://localhost:8083/api/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"COOP000001","amount":50.00,"description":"Test payment","reference":"PAY-001"}'

# Consultar historial
curl "http://localhost:8082/api/accounts/me/transactions?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

### PostgreSQL

```bash
# Conectar
psql -h localhost -p 5432 -d coop -U coop

# Verificar transacciones
SELECT * FROM accounts.account_transactions ORDER BY id DESC LIMIT 10;

# Verificar pagos
SELECT * FROM payments.payments ORDER BY id DESC LIMIT 10;

# Verificar saldo
SELECT account_number, balance FROM accounts.accounts;
```

---

## Estado de Validación

| Punto | Estado | Notas |
|-------|--------|-------|
| 1. Registrar socio | Pendiente | |
| 2. Iniciar sesión | Pendiente | |
| 3. Obtener JWT | Pendiente | |
| 4. Consultar cuenta | Pendiente | |
| 5. Consultar saldo | Pendiente | |
| 6. Transferir saldo | Pendiente | |
| 7. Registrar pago | Pendiente | |
| 8. Consultar historial | Pendiente | |
| 9. Ver en PostgreSQL | Pendiente | |
| 10. Docker Compose | Pendiente | |
| 11. Construir Docker | Pendiente | |
| 12. Bicep Azure | Pendiente | |
| 13. Desplegar Azure | Pendiente | |
| 14. Acceder frontend | Pendiente | |
| 15. Flujo completo Azure | Pendiente | |

---

## Conclusión

El MVP estará completo cuando todos los 15 puntos estén validados tanto localmente como en Azure.
