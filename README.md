# Coop EC

# Índice

[Propósito](#propósito) · [Capacidades](#capacidades) · [Arquitectura](#arquitectura) · [Inicio rápido](#inicio-rápido) · [Infraestructura y despliegue](#infraestructura-y-despliegue) · [Estado](#estado)

# Propósito

Coop EC es un MVP de plataforma financiera para una cooperativa. Permite a los socios autenticarse, consultar sus cuentas, realizar transferencias internas y registrar pagos simulados.

# Capacidades

El frontend presenta una experiencia web para registro, inicio de sesión, panel de cuentas e historial. Los servicios protegen las operaciones con JWT y persisten usuarios, cuentas, movimientos y pagos en PostgreSQL.

# Arquitectura

La aplicación combina Angular SSR con tres microservicios Spring Boot: `auth-service` gestiona identidad, `account-service` administra cuentas y transferencias, y `payment-service` registra pagos y solicita débitos. Los servicios se compilan como imágenes nativas y se ejecutan en Azure Container Apps.

# Inicio rápido

Para ejecutar el entorno local usa `docker compose up --build`. El frontend queda disponible en `http://localhost:4200`.

# Infraestructura y despliegue

Terraform administra Azure Container Apps, Container Registry, PostgreSQL, identidad administrada, observabilidad y Azure Service Bus. GitHub Actions construye las imágenes y despliega cambios mediante Microsoft Entra OIDC, sin credenciales de Azure embebidas en el repositorio.

# Estado

El proyecto ofrece un flujo funcional de demostración. La configuración de infraestructura y CI/CD se encuentra en `infrastructure/` y `.github/workflows/`.
