param location string
param projectName string
param environmentName string
param logAnalyticsWorkspaceId string
param tags object

var environmentNameVar = 'cae-${projectName}-${environmentName}'

resource environment 'Microsoft.App/managedEnvironments@2024-10-02-preview' = {
  name: environmentNameVar
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspaceId
      }
    }
  }
}

output environmentId string = environment.id
output environmentName string = environment.name
