param projectName string
param environmentName string
param githubOwner string
param githubRepo string
param tags object

var appName = 'sp-${projectName}-${environmentName}-github-actions'
var identityResourceId = resourceId('Microsoft.ManagedIdentity/userAssignedIdentities', 'id-${projectName}-${environmentName}-acr-pull')

resource deploymentScript 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
  name: 'setup-github-oidc-${environmentName}'
  location: resourceGroup().location
  tags: tags
  kind: 'AzureCLI'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identityResourceId}': {}
    }
  }
  properties: {
    azCliVersion: '2.64.0'
    timeout: 'PT10M'
    retentionInterval: 'PT1H'
    cleanupPreference: 'Always'
    scriptContent: <<-'SCRIPT'
      #!/bin/bash
      set -euo pipefail

      APP_NAME="${APP_NAME}"
      GITHUB_OWNER="${GITHUB_OWNER}"
      GITHUB_REPO="${GITHUB_REPO}"
      ENV_NAME="${ENV_NAME}"

      echo "Creating App Registration: $APP_NAME"
      APP_ID=$(az ad app create --display-name "$APP_NAME" --sign-in-audience AzureADMyOrg --query appId -o tsv)
      echo "App ID: $APP_ID"

      echo "Creating Service Principal"
      az ad sp create --id "$APP_ID" --output none

      echo "Creating federated credential for environment: $ENV_NAME"
      az ad app federated-credential create --id "$APP_ID" --parameters "{
        \"name\": \"github-${ENV_NAME}-env\",
        \"issuer\": \"https://token.actions.githubusercontent.com\",
        \"subject\": \"repo:${GITHUB_OWNER}/${GITHUB_REPO}:environment:${ENV_NAME}\",
        \"audiences\": [\"api://AzureADTokenExchange\"]
      }" --output none

      echo "Creating federated credential for main branch"
      az ad app federated-credential create --id "$APP_ID" --parameters "{
        \"name\": \"github-main-ref\",
        \"issuer\": \"https://token.actions.githubusercontent.com\",
        \"subject\": \"repo:${GITHUB_OWNER}/${GITHUB_REPO}:ref:refs/heads/main\",
        \"audiences\": [\"api://AzureADTokenExchange\"]
      }" --output none

      SUB_ID=$(az account show --query id -o tsv)

      echo "Assigning Contributor role"
      az role assignment create --assignee "$APP_ID" --role "Contributor" --scope "/subscriptions/$SUB_ID" --output none

      echo "Assigning AcrPush role"
      az role assignment create --assignee "$APP_ID" --role "AcrPush" --scope "/subscriptions/$SUB_ID" --output none

      echo "CLIENT_ID=$APP_ID"
    SCRIPT
    environmentVariables: [
      {
        name: 'APP_NAME'
        value: appName
      }
      {
        name: 'GITHUB_OWNER'
        value: githubOwner
      }
      {
        name: 'GITHUB_REPO'
        value: githubRepo
      }
      {
        name: 'ENV_NAME'
        value: environmentName
      }
    ]
  }
}

output clientId string = deploymentScript.name
