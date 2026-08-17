#!/bin/bash
set -euo pipefail

echo "=== 001: Docker Local ==="
echo ""

echo "Construyendo imágenes Docker..."
docker compose build

echo ""
echo "Iniciando servicios..."
docker compose up -d

echo ""
echo "Esperando a que PostgreSQL esté listo..."
sleep 10

echo ""
echo "=== Servicios iniciados ==="
echo "Frontend:      http://localhost:4200"
echo "auth-service:  http://localhost:8081"
echo "account-service: http://localhost:8082"
echo "payment-service: http://localhost:8083"
echo "PostgreSQL:    localhost:5432"
echo ""
echo "Para verificar: docker compose ps"
