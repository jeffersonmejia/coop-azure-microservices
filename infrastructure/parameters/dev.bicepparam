using '../main.bicep'

param location = 'southcentralus'
param environmentName = 'dev'
param projectName = 'coop'

param tags = {
  environment: 'dev'
  project: 'coop'
  managedBy: 'bicep'
}
