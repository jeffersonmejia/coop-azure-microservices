using '../main-db.bicep'

param location = 'brazilSouth'
param projectName = 'coop'
param environmentName = 'dev'

param administratorLogin = 'coopadmin'
param administratorLoginPassword = 'C00pDb2024!'

param tags = {
  environment: 'dev'
  project: 'coop'
  region: 'brazilSouth'
  managedBy: 'bicep'
}
