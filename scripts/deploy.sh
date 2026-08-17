#!/bin/bash
set -euo pipefail

RESOURCE_GROUP="rg-coop-dev"
LOCATION="eastus"
ENVIRONMENT="dev"
PROJECT="coop"
ACR_NAME="acr${PROJECT}${ENVIRONMENT}"

echo "=== Validating Bicep templates ==="
az bicep build --file infrastructure/main.bicep
az deployment group validate \
  --resource-group "$RESOURCE_GROUP" \
  --template-file infrastructure/main.bicep \
  --parameters infrastructure/parameters/dev.bicepparam

echo "=== Creating resource group ==="
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

echo "=== Deploying infrastructure ==="
az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file infrastructure/main.bicep \
  --parameters infrastructure/parameters/dev.bicepparam \
  --output table

echo "=== Building and pushing Docker images ==="
az acr login --name "$ACR_NAME"

docker build -t "$ACR_NAME.azurecr.io/coop-frontend:latest" ./frontend
docker push "$ACR_NAME.azurecr.io/coop-frontend:latest"

docker build -t "$ACR_NAME.azurecr.io/coop-auth:latest" ./services/auth-service
docker push "$ACR_NAME.azurecr.io/coop-auth:latest"

docker build -t "$ACR_NAME.azurecr.io/coop-account:latest" ./services/account-service
docker push "$ACR_NAME.azurecr.io/coop-account:latest"

docker build -t "$ACR_NAME.azurecr.io/coop-payment:latest" ./services/payment-service
docker push "$ACR_NAME.azurecr.io/coop-payment:latest"

echo "=== Restarting container apps ==="
for app in ca-coop-dev-frontend ca-coop-dev-auth ca-coop-dev-account ca-coop-dev-payment; do
  az containerapp restart --name "$app" --resource-group "$RESOURCE_GROUP" --output none
done

echo "=== Deployment complete ==="
az containerapp list --resource-group "$RESOURCE_GROUP" --query "[].{Name:name, Fqdn:properties.configuration.ingress.fqdn}" --output table
