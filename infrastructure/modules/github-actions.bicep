param projectName string
param environmentName string
param githubOwner string
param githubRepo string
param tags object

var appName = 'sp-${projectName}-${environmentName}-github-actions'
var scriptContent = '#!/bin/bash\nset -euo pipefail\nAPP_ID=$(az ad app create --display-name "${appName}" --sign-in-audience AzureADMyOrg --query appId -o tsv)\naz ad sp create --id "$APP_ID" --output none\naz ad app federated-credential create --id "$APP_ID" --parameters "{\\\"name\\\": \\\"github-${environmentName}-env\\\", \\\"issuer\\\": \\\"https://token.actions.githubusercontent.com\\\", \\\"subject\\\": \\\"repo:${githubOwner}/${githubRepo}:environment:${environmentName}\\\", \\\"audiences\\\": [\\\"api://AzureADTokenExchange\\\"]}" --output none\naz ad app federated-credential create --id "$APP_ID" --parameters "{\\\"name\\\": \\\"github-main-ref\\\", \\\"issuer\\\": \\\"https://token.actions.githubusercontent.com\\\", \\\"subject\\\": \\\"repo:${githubOwner}/${githubRepo}:ref:refs/heads/main\\\", \\\"audiences\\\": [\\\"api://AzureADTokenExchange\\\"]}" --output none\nSUB_ID=$(az account show --query id -o tsv)\naz role assignment create --assignee "$APP_ID" --role "Contributor" --scope "/subscriptions/$SUB_ID" --output none\nnaz role assignment create --assignee "$APP_ID" --role "AcrPush" --scope "/subscriptions/$SUB_ID" --output none\necho "CLIENT_ID=$APP_ID"'

resource deploymentScript 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
  name: 'setup-github-oidc-${environmentName}'
  location: resourceGroup().location
  tags: tags
  kind: 'AzureCLI'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${resourceGroup().id}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/id-${projectName}-${environmentName}-acr-pull': {}
    }
  }
  properties: {
    azCliVersion: '2.64.0'
    timeout: 'PT10M'
    retentionInterval: 'PT1H'
    cleanupPreference: 'Always'
    scriptContent: scriptContent
  }
}

output clientId string = deploymentScript.name
