param location string
param projectName string
param environmentName string
param tags object

var vaultName = 'kv${projectName}${environmentName}br'

resource keyVault 'Microsoft.KeyVault/vaults@2024-11-01' = {
  name: vaultName
  location: location
  tags: tags
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enableRbacAuthorization: true
    enablePurgeProtection: true
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

output vaultName string = keyVault.name
output vaultUri string = keyVault.properties.vaultUri
output jwtSecretUri string = '${keyVault.properties.vaultUri}secrets/jwt-secret'
output id string = keyVault.id
