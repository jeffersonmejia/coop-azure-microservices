param location string
param projectName string
param environmentName string
param serverPort int = 8082
param acrLoginServer string
param acrManagedIdentityId string
param jwtSecret string
param dbConnectionString string
param tags object

var appName = 'ca-${projectName}-${environmentName}-account'
var environmentNameVar = 'cae-${projectName}-${environmentName}'
var containerImage = '${acrLoginServer}/${projectName}-account:latest'

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
        targetPort: serverPort
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
          env: [
            {
              name: 'SERVER_PORT'
              value: string(serverPort)
            }
            {
              name: 'SPRING_DATASOURCE_URL'
              value: dbConnectionString
            }
            {
              name: 'SPRING_DATASOURCE_USERNAME'
              value: 'coop'
            }
            {
              name: 'SPRING_DATASOURCE_PASSWORD'
              secretRef: 'db-password'
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
          ]
          resources: {
            cpu: '0.25'
            memory: '0.5Gi'
          }
        }
      ]
      secrets: [
        {
          name: 'jwt-secret'
          keyVaultUrl: jwtSecret
        }
        {
          name: 'db-password'
          value: 'coop'
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

output fqdn string = containerApp.properties.configuration.ingress.fqdn
output name string = containerApp.name
