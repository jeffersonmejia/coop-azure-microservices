#!/bin/bash
set -euo pipefail

echo "=== 004: Flujo Completo Azure ==="
echo ""

# Obtener URL del frontend
FRONTEND_URL="https://ca-coop-frontend-dev.eastus.azurecontainerapps.io"
AUTH_URL="https://ca-coop-auth-dev.eastus.azurecontainerapps.io"
ACCOUNT_URL="https://ca-coop-account-dev.eastus.azurecontainerapps.io"
PAYMENT_URL="https://ca-coop-payment-dev.eastus.azurecontainerapps.io"

echo "Frontend: $FRONTEND_URL"
echo "auth-service: $AUTH_URL"
echo "account-service: $ACCOUNT_URL"
echo "payment-service: $PAYMENT_URL"
echo ""

# 1. Registrar socio
echo "1. Registrando socio..."
curl -s -X POST "$AUTH_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"azure@coop.com","password":"test123","firstName":"Azure","lastName":"Test"}'
echo ""

# 2. Login
echo "2. Iniciando sesión..."
LOGIN=$(curl -s -X POST "$AUTH_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"azure@coop.com","password":"test123"}')
TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token obtenido"
echo ""

# 4. Consultar cuenta
echo "4. Consultando cuenta..."
curl -s "$ACCOUNT_URL/api/accounts/me" \
  -H "Authorization: Bearer $TOKEN"
echo ""

# 5. Consultar saldo
echo "5. Consultando saldo..."
curl -s "$ACCOUNT_URL/api/accounts/me" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"balance":[0-9.]*'
echo ""

# 6. Transferir
echo "6. Transferiendo saldo..."
curl -s -X POST "$ACCOUNT_URL/api/accounts/transfer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destinationAccountNumber":"AZURE000002","amount":50.00}'
echo ""

# 7. Registrar pago
echo "7. Registrando pago..."
curl -s -X POST "$PAYMENT_URL/api/payments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"AZURE000001","amount":25.00,"description":"Azure test","reference":"AZURE-001"}'
echo ""

# 8. Consultar historial
echo "8. Consultando historial..."
curl -s "$ACCOUNT_URL/api/accounts/me/transactions?page=0&size=5" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "=== Flujo Azure completado ==="
echo "Acceder al frontend: $FRONTEND_URL"
