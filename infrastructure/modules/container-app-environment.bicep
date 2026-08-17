param location string
param projectName string
param environmentName string
param tags object

var environmentNameVar = 'cae-${projectName}-${environmentName}'

resource environment 'Microsoft.App/managedEnvironments@2025-01-01' = {
  name: environmentNameVar
  location: location
  tags: tags
  properties: {}
}

output environmentId string = environment.id
output environmentName string = environment.name
