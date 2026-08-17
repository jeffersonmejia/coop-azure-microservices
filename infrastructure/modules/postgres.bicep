param location string
param projectName string
param environmentName string
param tags object

var serverName = 'psql-${projectName}-${environmentName}'
var dbName = 'coop'

resource flexibleServer 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: serverName
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '14'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    auth: {
      passwordAuth: 'Enabled'
      activeDirectoryAuth: 'Disabled'
    }
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: flexibleServer
  name: dbName
}

output serverName string = flexibleServer.name
output connectionString string = 'jdbc:postgresql://${flexibleServer.name}.postgres.database.azure.com:5432/${dbName}?sslmode=require'
output id string = flexibleServer.id
