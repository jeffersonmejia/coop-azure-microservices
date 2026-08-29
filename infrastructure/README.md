# Infraestructura Terraform

Esta configuración adopta la infraestructura `dev` que ya existe en Azure. No
debe ejecutarse sobre una cuenta vacía sin retirar o adaptar primero
`imports.tf`.

## Alcance

- `rg-coop-scus-dev` en `southcentralus`: ACR, identidad administrada, Key
  Vault, observabilidad, Service Bus Standard, Container Apps Environment y
  cuatro Container Apps.
- `rg-coop-db-brazil` en `brazilsouth`: PostgreSQL Flexible Server, base `coop`
  y la regla `AllowAzureServices`.
- Microsoft Entra: aplicación y service principal de GitHub Actions, dos
  credenciales OIDC activas y sus asignaciones actuales.

Los módulos reflejan la configuración observada en Azure el 20 de agosto de
2026. Los cambios de imagen hechos por GitHub Actions se ignoran deliberadamente
en Terraform para que IaC y CI no compitan por las revisiones desplegadas.

## Mensajería

El módulo `service-bus` crea un namespace globalmente único en la región de las
aplicaciones (para `dev`, `sb-coop-dev-d5174d35`) y las colas
`payment-requests` y `payment-results`. Las colas tienen deduplicación (en
solicitudes), 10 entregas máximas y dead-letter queue automática al expirar
mensajes. La identidad administrada ya asignada a las Container Apps recibe los
roles `Azure Service Bus Data Sender` y `Azure Service Bus Data Receiver`; por
ello no se almacenan connection strings.

## Preparación

```bash
cd infrastructure
cp secrets.auto.tfvars.example secrets.auto.tfvars
# Editar solo el archivo local secrets.auto.tfvars.
terraform init
terraform validate
```

También se pueden proporcionar los secretos sin crear un archivo:

```bash
export TF_VAR_postgres_administrator_password='...'
export TF_VAR_jwt_secret='...'
```

## Adopción segura del estado existente

Antes del primer `apply`, revisar siempre el plan:

```bash
terraform plan -var-file=dev.tfvars -out=dev.tfplan
terraform show dev.tfplan
```

Los bloques de `imports.tf` importan los recursos desplegados durante ese primer
flujo; no solicitan recursos nuevos. `prevent_destroy` bloquea eliminaciones y
reemplazos accidentales. Si el plan indica `create`, `destroy` o `replace`, no
se debe aplicar hasta reconciliar la diferencia.

PostgreSQL estaba detenido durante el inventario. Azure no permitió consultar
la base mientras permanecía detenido; el recurso `coop` se conserva en el
código porque estaba definido en la infraestructura anterior y es la base usada
por las aplicaciones.

## Secretos y estado

No hay contraseñas ni JWT versionados. Terraform sí necesita esos valores para
configurar PostgreSQL y las Container Apps, por lo que el archivo de estado debe
tratarse como sensible. El estado local está ignorado por Git; para trabajo en
equipo se debe configurar un backend remoto existente con cifrado y acceso
restringido antes de aplicar.

El workflow `Infrastructure` crea de forma idempotente la cuenta de
almacenamiento `stcoopdevd5174d35` y el contenedor privado `tfstate` para usar
el backend remoto `coop-dev.tfstate`. Antes de activarlo en GitHub, crear el
secreto `AZURE_JWT_SECRET` con el mismo valor que usa el entorno; el workflow
ya reutiliza `AZURE_DB_PASSWORD`.
