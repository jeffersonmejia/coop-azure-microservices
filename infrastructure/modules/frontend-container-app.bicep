param location string
param projectName string
param environmentName string
param targetPort int = 4200
param acrLoginServer string
param acrManagedIdentityId string
param envVars object = {}
param tags object

var appName = 'ca-${projectName}-${environmentName}-frontend'
var environmentNameVar = 'cae-${projectName}-${environmentName}'
var containerImage = '${acrLoginServer}/${projectName}-frontend:latest'

resource managedEnvironment 'Microsoft.App/managedEnvironments@2024-10-02-preview' existing = {
  name: environmentNameVar
}

resource containerApp 'Microsoft.App/containerApps@2025-01-01' = {
  name: appName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${acrManagedIdentityId}': {}
    }
  }
  properties: {
    environmentId: managedEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: targetPort
        transport: 'http'
      }
      registries: [
        {
          server: acrLoginServer
          identity: acrManagedIdentityId
        }
      ]
    }
    template: {
      containers: [
        {
          name: appName
          image: containerImage
          env: []
          resources: {
            cpu: '0.25'
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 2
      }
    }
  }
}

output fqdn string = containerApp.properties.configuration.ingress.fqdn
output name string = containerApp.name
