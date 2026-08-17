#!/bin/bash
set -euo pipefail

echo "=== 002: Flujo Completo Local ==="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
    local desc="$1"
    local result="$2"
    if [[ "$result" == "PASS" ]]; then
        echo -e "${GREEN}[PASS]${NC} $desc"
        ((PASS++))
    else
        echo -e "${RED}[FAIL]${NC} $desc - $result"
        ((FAIL++))
    fi
}

# 1. Registrar socio
echo "1. Registrando socio..."
REGISTER=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@coop.com","password":"test123","firstName":"Test","lastName":"User"}')
HTTP_CODE=$(echo "$REGISTER" | tail -n1)
BODY=$(echo "$REGISTER" | head -n-1)
check "Registrar socio" "$( [[ "$HTTP_CODE" == "201" ]] && echo "PASS" || echo "HTTP $HTTP_CODE" )"
echo ""

# 2. Login
echo "2. Iniciando sesión..."
LOGIN=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@coop.com","password":"test123"}')
HTTP_CODE=$(echo "$LOGIN" | tail -n1)
BODY=$(echo "$LOGIN" | head -n-1)
check "Login" "$( [[ "$HTTP_CODE" == "200" ]] && echo "PASS" || echo "HTTP $HTTP_CODE" )"

# 3. Obtener JWT
TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [[ -n "$TOKEN" ]]; then
    check "Obtener JWT" "PASS"
else
    check "Obtener JWT" "No token received"
fi
echo ""

# 4. Consultar cuenta
echo "4. Consultando cuenta..."
ACCOUNT=$(curl -s -w "\n%{http_code}" http://localhost:8082/api/accounts/me \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$ACCOUNT" | tail -n1)
BODY=$(echo "$ACCOUNT" | head -n-1)
ACCOUNT_NUMBER=$(echo "$BODY" | grep -o '"accountNumber":"[^"]*"' | cut -d'"' -f4)
check "Consultar cuenta" "$( [[ "$HTTP_CODE" == "200" ]] && echo "PASS" || echo "HTTP $HTTP_CODE" )"
echo ""

# 5. Consultar saldo
echo "5. Consultando saldo..."
BALANCE=$(echo "$BODY" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
check "Consultar saldo" "$( [[ -n "$BALANCE" ]] && echo "PASS ($BALANCE USD)" || echo "No balance" )"
echo ""

# 6. Transferir saldo
echo "6. Transferiendo saldo..."
TRANSFER=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8082/api/accounts/transfer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destinationAccountNumber":"COOP000002","amount":100.00}')
HTTP_CODE=$(echo "$TRANSFER" | tail -n1)
check "Transferir saldo" "$( [[ "$HTTP_CODE" == "200" ]] && echo "PASS" || echo "HTTP $HTTP_CODE" )"
echo ""

# 7. Registrar pago
echo "7. Registrando pago..."
PAYMENT=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8083/api/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"accountNumber\":\"$ACCOUNT_NUMBER\",\"amount\":50.00,\"description\":\"Test payment\",\"reference\":\"PAY-$(date +%s)\"}")
HTTP_CODE=$(echo "$PAYMENT" | tail -n1)
check "Registrar pago" "$( [[ "$HTTP_CODE" == "201" ]] && echo "PASS" || echo "HTTP $HTTP_CODE" )"
echo ""

# 8. Consultar historial
echo "8. Consultando historial..."
HISTORY=$(curl -s -w "\n%{http_code}" "http://localhost:8082/api/accounts/me/transactions?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$HISTORY" | tail -n1)
check "Consultar historial" "$( [[ "$HTTP_CODE" == "200" ]] && echo "PASS" || echo "HTTP $HTTP_CODE" )"
echo ""

# 9. Verificar PostgreSQL
echo "9. Verificando PostgreSQL..."
export PGPASSWORD=coop
PSQL="psql -h localhost -p 5432 -d coop -U coop -t -A"
TRANS_COUNT=$($PSQL -c "SELECT COUNT(*) FROM accounts.account_transactions;")
PAY_COUNT=$($PSQL -c "SELECT COUNT(*) FROM payments.payments;")
check "Verificar PostgreSQL" "$( [[ "$TRANS_COUNT" -gt 0 && "$PAY_COUNT" -gt 0 ]] && echo "PASS (trans: $TRANS_COUNT, pay: $PAY_COUNT)" || echo "No data" )"
echo ""

# Resumen
echo "============================================"
echo "  RESUMEN"
echo "============================================"
echo ""
echo "  Pass: $PASS"
echo "  Fail: $FAIL"
echo ""

if [[ $FAIL -eq 0 ]]; then
    echo -e "  ${GREEN}TODAS LAS PRUEBAS PASARON${NC}"
else
    echo -e "  ${RED}ALGUNAS PRUEBAS FALLARON${NC}"
fi
