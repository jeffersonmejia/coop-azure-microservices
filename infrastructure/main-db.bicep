param location string
param projectName string
param environmentName string
param tags object

@secure()
param administratorLogin string

@secure()
param administratorLoginPassword string

module postgres 'modules/postgres.bicep' = {
  name: 'deploy-postgres'
  params: {
    location: location
    projectName: projectName
    environmentName: environmentName
    tags: tags
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
  }
}

output connectionString string = postgres.outputs.connectionString
output serverName string = postgres.outputs.serverName
