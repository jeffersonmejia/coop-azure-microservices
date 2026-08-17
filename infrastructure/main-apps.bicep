param location string
param environmentName string
param projectName string
param tags object
param dbConnectionString string

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

module frontendApp 'modules/frontend-container-app.bicep' = {
  name: 'deploy-frontend'
  params: {
    location: location
    environmentName: environmentName
    projectName: projectName
    acrLoginServer: acr.outputs.loginServer
    acrManagedIdentityId: identities.outputs.acrPullIdentityId
    targetPort: 4200
    tags: tags
  }
  dependsOn: [containerAppEnvironment, acr, identities]
}

module authApp 'modules/auth-container-app.bicep' = {
  name: 'deploy-auth'
  params: {
    location: location
    environmentName: environmentName
    projectName: projectName
    acrLoginServer: acr.outputs.loginServer
    acrManagedIdentityId: identities.outputs.acrPullIdentityId
    serverPort: 8081
    jwtSecret: keyVault.outputs.jwtSecretUri
    dbConnectionString: dbConnectionString
    tags: tags
  }
  dependsOn: [containerAppEnvironment, acr, identities, keyVault]
}

module accountApp 'modules/account-container-app.bicep' = {
  name: 'deploy-account'
  params: {
    location: location
    environmentName: environmentName
    projectName: projectName
    acrLoginServer: acr.outputs.loginServer
    acrManagedIdentityId: identities.outputs.acrPullIdentityId
    serverPort: 8082
    jwtSecret: keyVault.outputs.jwtSecretUri
    dbConnectionString: dbConnectionString
    tags: tags
  }
  dependsOn: [containerAppEnvironment, acr, identities, keyVault]
}

module paymentApp 'modules/payment-container-app.bicep' = {
  name: 'deploy-payment'
  params: {
    location: location
    environmentName: environmentName
    projectName: projectName
    acrLoginServer: acr.outputs.loginServer
    acrManagedIdentityId: identities.outputs.acrPullIdentityId
    serverPort: 8083
    jwtSecret: keyVault.outputs.jwtSecretUri
    dbConnectionString: dbConnectionString
    accountServiceUrl: 'http://${accountApp.outputs.fqdn}'
    tags: tags
  }
  dependsOn: [containerAppEnvironment, acr, identities, keyVault, accountApp]
}

output frontendUrl string = frontendApp.outputs.fqdn
output authUrl string = authApp.outputs.fqdn
output accountUrl string = accountApp.outputs.fqdn
output paymentUrl string = paymentApp.outputs.fqdn
output acrLoginServer string = acr.outputs.loginServer
