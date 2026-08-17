param location string
param environmentName string
param projectName string
param tags object

var acrName = 'acr${projectName}${environmentName}'

module acr 'modules/acr.bicep' = {
  name: 'deploy-acr'
  params: {
    location: location
    acrName: acrName
    tags: tags
  }
}

module keyVault 'modules/key-vault.bicep' = {
  name: 'deploy-key-vault'
  params: {
    location: location
    projectName: projectName
    environmentName: environmentName
    tags: tags
  }
}

module identities 'modules/identities.bicep' = {
  name: 'deploy-identities'
  params: {
    projectName: projectName
    environmentName: environmentName
    tags: tags
  }
}

module monitoring 'modules/monitoring.bicep' = {
  name: 'deploy-monitoring'
  params: {
    location: location
    projectName: projectName
    environmentName: environmentName
    tags: tags
  }
}

module containerAppEnvironment 'modules/container-app-environment.bicep' = {
  name: 'deploy-cae'
  params: {
    location: location
    projectName: projectName
    environmentName: environmentName
    tags: tags
  }
}

output acrLoginServer string = acr.outputs.loginServer
output acrId string = acr.outputs.id
output keyVaultUri string = keyVault.outputs.vaultUri
output managedEnvironmentId string = containerAppEnvironment.outputs.environmentId
output identityId string = identities.outputs.acrPullIdentityId
