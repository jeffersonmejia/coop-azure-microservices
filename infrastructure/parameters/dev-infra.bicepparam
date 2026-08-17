using '../main-infra.bicep'

param location = 'southcentralus'
param projectName = 'coop'
param environmentName = 'dev'

param tags = {
  environment: 'dev'
  project: 'coop'
  region: 'southcentralus'
  managedBy: 'bicep'
}
