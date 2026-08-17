using '../main-apps.bicep'

param location = 'southcentralus'
param projectName = 'coop'
param environmentName = 'dev'
param dbConnectionString = 'jdbc:postgresql://psql-coop-dev.postgres.database.azure.com:5432/coop?sslmode=require'

param tags = {
  environment: 'dev'
  project: 'coop'
  region: 'southcentralus'
  managedBy: 'bicep'
}
