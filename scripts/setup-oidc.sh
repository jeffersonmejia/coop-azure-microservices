#!/bin/bash
set -euo pipefail

APP_NAME="${1:-sp-coop-dev-github-actions}"
GITHUB_OWNER="${2:-jeffersonmejia}"
GITHUB_REPO="${3:-coop-azure-microservices}"
ENV_NAME="${4:-dev}"

echo "=== Setting up GitHub OIDC for Azure ==="
echo "App Name: $APP_NAME"
echo "GitHub: $GITHUB_OWNER/$GITHUB_REPO"
echo "Environment: $ENV_NAME"
echo ""

# Create App Registration
echo "Creating App Registration..."
APP_ID=$(az ad app create --display-name "$APP_NAME" --sign-in-audience AzureADMyOrg --query appId -o tsv)
echo "App ID: $APP_ID"

# Create Service Principal
echo "Creating Service Principal..."
az ad sp create --id "$APP_ID" --output none

# Create federated credential for environment
echo "Creating federated credential for environment: $ENV_NAME..."
az ad app federated-credential create --id "$APP_ID" --parameters "{
  \"name\": \"github-${ENV_NAME}-env\",
  \"issuer\": \"https://token.actions.githubusercontent.com\",
  \"subject\": \"repo:${GITHUB_OWNER}/${GITHUB_REPO}:environment:${ENV_NAME}\",
  \"audiences\": [\"api://AzureADTokenExchange\"]
}" --output none

# Create federated credential for main branch
echo "Creating federated credential for main branch..."
az ad app federated-credential create --id "$APP_ID" --parameters "{
  \"name\": \"github-main-ref\",
  \"issuer\": \"https://token.actions.githubusercontent.com\",
  \"subject\": \"repo:${GITHUB_OWNER}/${GITHUB_REPO}:ref:refs/heads/main\",
  \"audiences\": [\"api://AzureADTokenExchange\"]
}" --output none

# Assign roles
SUB_ID=$(az account show --query id -o tsv)

echo "Assigning Contributor role..."
az role assignment create --assignee "$APP_ID" --role "Contributor" --scope "/subscriptions/$SUB_ID" --output none

echo "Assigning AcrPush role..."
az role assignment create --assignee "$APP_ID" --role "AcrPush" --scope "/subscriptions/$SUB_ID" --output none

echo ""
echo "=== Setup Complete ==="
echo "Client ID (AZURE_CLIENT_ID): $APP_ID"
echo ""
echo "Add this to your GitHub secrets:"
echo "  AZURE_CLIENT_ID=$APP_ID"
