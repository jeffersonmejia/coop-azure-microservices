param location string
param acrName string
param tags object

resource acr 'Microsoft.ContainerRegistry/registries@2024-09-01-preview' = {
  name: acrName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
  }
}

output loginServer string = acr.properties.loginServer
output id string = acr.id
