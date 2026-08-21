# Coop EC

Plataforma financiera cooperativa construida con Angular, microservicios Spring Boot y servicios administrados de Azure.

## Índice

1. [Capacidades](#1-capacidades)
2. [Arquitectura](#2-arquitectura)
3. [Inicio rápido](#3-inicio-rápido)
4. [Documentación](#4-documentación)
5. [Estructura](#5-estructura)
6. [Estado](#6-estado)

## 1. Capacidades

- Registro e inicio de sesión con JWT.
- Gestión de cuentas y consulta de saldo.
- Transferencias internas atómicas.
- Pagos simulados mediante débito en `account-service`.
- Historial paginado de transacciones y pagos.

## 2. Arquitectura

El sistema contiene un frontend Angular SSR y tres microservicios Spring Boot comunicados mediante REST. PostgreSQL mantiene los esquemas `auth`, `accounts` y `payments`.

La solución está desplegada en Azure Container Apps. Terraform administra la infraestructura existente y GitHub Actions construye y publica las imágenes nativas.

| Capa | Tecnología |
|---|---|
| Frontend | Angular 21, Angular Material, SSR |
| Backend | Java 21, Spring Boot 4.1, Spring Security, JPA, Flyway |
| Datos | PostgreSQL 17 en Azure; PostgreSQL 16 local |
| Azure | Container Apps, ACR, Key Vault, Managed Identity, Azure Monitor |
| IaC y CI/CD | Terraform, Microsoft Entra OIDC, GitHub Actions |

## 3. Inicio rápido

```bash
docker compose up --build
```

La aplicación queda disponible en `http://localhost:4200`.

## 4. Documentación

| Tema | Documento |
|---|---|
| Arquitectura | [Índice de diagramas](docs/architecture/README.md) |
| C4 | [Level 1, Level 2 y Level 3](docs/architecture/c4/) |
| Despliegue | [Azure y Terraform](docs/architecture/deployment/azure.md) |
| Flujos | [Diagramas de secuencia](docs/architecture/sequence/) |
| Servicios, API y seguridad | [docs/services.md](docs/services.md) |
| Desarrollo, configuración y pruebas | [docs/development.md](docs/development.md) |
| Infraestructura Terraform | [infrastructure/README.md](infrastructure/README.md) |
| Dataset Berka | [scripts/data/README.md](scripts/data/README.md) |
| Notas técnicas | [docs/technical-notes.md](docs/technical-notes.md) |
| Fuera del alcance | [docs/out-of-scope.md](docs/out-of-scope.md) |

## 5. Estructura

```text
coop-ec/
├── frontend/          # Angular SSR
├── services/          # auth, account y payment
├── infrastructure/    # Terraform modular
├── docs/              # Documentación temática y diagramas
├── scripts/data/      # Importación y pruebas de volumen
└── docker-compose.yml # Entorno local
```

## 6. Estado

El MVP funcional y su infraestructura están desplegados en Azure. El alcance excluido está documentado por separado para no confundir capacidades demostrativas con requisitos de producción.
