#!/bin/bash
set -euo pipefail

echo "=== 003: Azure Deployment ==="
echo ""

# Verificar Azure CLI
if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI no encontrado"
    echo "Instalar: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Verificar login
if ! az account show &> /dev/null; then
    echo "No hay sesión activa. Ejecutando az login..."
    az login
fi

echo "Sesión Azure activa:"
az account show --query "{Subscription:subscriptionId, Name:name}" --output table
echo ""

# Ejecutar deploy
echo "Ejecutando deploy.sh..."
bash scripts/deploy.sh

echo ""
echo "=== Deployment completado ==="
