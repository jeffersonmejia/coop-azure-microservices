#!/bin/bash
set -euo pipefail

echo "=== 001: Docker Local ==="
echo ""

if docker compose ps --format '{{.Names}}' 2>/dev/null | grep -q .; then
  echo "Contenedores ya corriendo, verificando estado..."
else
  echo "Construyendo imágenes Docker..."
  docker compose build

  echo ""
  echo "Iniciando servicios..."
  docker compose up -d
fi

echo ""
echo "Esperando a que PostgreSQL esté listo..."
TIMEOUT=30
ELAPSED=0
until docker compose exec -T db pg_isready -q 2>/dev/null; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "Error: PostgreSQL no respondió en ${TIMEOUT}s"
    docker compose ps
    exit 1
  fi
  sleep 1
  ELAPSED=$((ELAPSED + 1))
done
echo "PostgreSQL listo en ${ELAPSED}s"

echo ""
echo "=== Servicios ==="
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "=== Logs recientes ==="
docker compose logs --tail=5 --timestamps
