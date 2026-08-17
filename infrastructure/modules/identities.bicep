param projectName string
param environmentName string
param tags object

var identityName = 'id-${projectName}-${environmentName}-acr-pull'

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: resourceGroup().location
  tags: tags
}

output acrPullIdentityId string = managedIdentity.id
output acrPullIdentityPrincipalId string = managedIdentity.properties.principalId
output name string = managedIdentity.name
