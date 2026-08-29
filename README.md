# Coop EC

# Índice

1. [Propósito](#1-propósito)
2. [Capacidades](#2-capacidades)
3. [Arquitectura](#3-arquitectura)
4. [Inicio rápido](#4-inicio-rápido)
5. [Infraestructura y despliegue](#5-infraestructura-y-despliegue)

# 1. Propósito

Coop EC es un MVP de plataforma financiera para una cooperativa. Permite a los socios autenticarse, consultar sus cuentas, realizar transferencias internas y registrar pagos simulados.

# 2. Capacidades

El frontend presenta una experiencia web para registro, inicio de sesión, panel de cuentas e historial. Los servicios protegen las operaciones con JWT y persisten usuarios, cuentas, movimientos y pagos en PostgreSQL.

# 3. Arquitectura

La aplicación combina Angular SSR con tres microservicios Spring Boot: `auth-service` gestiona identidad, `account-service` administra cuentas y transferencias, y `payment-service` registra pagos y solicita débitos. Los servicios se compilan como imágenes nativas y se ejecutan en Azure Container Apps.

# 4. Inicio rápido

1. Ejecuta `docker compose up --build`.
2. Abre `http://localhost:4200`.

# 5. Infraestructura y despliegue

| Área | Detalle |
| --- | --- |
| Terraform | Administra Azure Container Apps, Container Registry, PostgreSQL, identidad administrada, observabilidad y Azure Service Bus. |
| GitHub Actions | Construye las imágenes y despliega cambios mediante Microsoft Entra OIDC. |
| Seguridad | No se almacenan credenciales de Azure embebidas en el repositorio. |
| Configuración | La infraestructura y la CI/CD se encuentran en `infrastructure/` y `.github/workflows/`. |
