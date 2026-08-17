using '../main.bicep'

param location = 'eastus'
param environmentName = 'dev'
param projectName = 'coop'

param tags = {
  environment: 'dev'
  project: 'coop'
  managedBy: 'bicep'
}
