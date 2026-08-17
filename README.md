# Coop EC

Cooperative financial application built with Angular, Spring Boot microservices, and Microsoft Azure cloud-native services.

---

## Overview

Coop EC is a digital banking platform designed for cooperative financial institutions. It enables member management, account operations, transfers, and payment processing through a modern microservices architecture deployed on Azure Container Apps.

**Architecture:** 4 deployable applications (1 frontend + 3 microservices) communicating via REST APIs, backed by PostgreSQL, and deployed on Azure with Infrastructure as Code.

**Key capabilities:**
- Member authentication and authorization
- Account management with real-time balance
- Peer-to-peer transfers
- Payment processing with external account service integration
- Transaction history with server-side pagination

---

## Features

- **Authentication:** Register, login, JWT-based session management
- **Accounts:** Auto-creation on first access, balance inquiry, transaction history
- **Transfers:** Atomic peer-to-peer transfers with balance validation
- **Payments:** Payment processing with debit request to account service
- **History:** Server-side paginated transaction and payment history
- **Frontend:** Angular 21 with Material Design 3, SSR, and proxy to backends

---

## Technology Stack

### Frontend
- Angular 21
- TypeScript
- Angular Material / Material Design 3
- Server-Side Rendering (SSR)

### Backend
- Java 21
- Spring Boot 4.1.0
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- OpenAPI / Swagger

### Cloud
- Azure Container Apps
- Azure Container Registry
- Azure Database for PostgreSQL
- Azure Key Vault
- Managed Identity
- Azure Monitor / Log Analytics

### Infrastructure as Code
- Azure Bicep (modular)

### Testing
- Unit Tests: JUnit 5 + Mockito
- Integration Tests: Testcontainers + PostgreSQL
- Contract Tests: API contract validation
- End-to-End Tests: Full stack flow

---

## Repository Structure

```
coop-ec/
├── frontend/                    # Angular 21 SSR application
├── services/
│   ├── auth-service/           # Authentication & authorization
│   ├── account-service/        # Accounts, transfers, transactions
│   └── payment-service/        # Payment processing
├── infrastructure/
│   ├── main.bicep             # Main orchestrator
│   ├── modules/               # Bicep modules
│   └── parameters/            # Environment parameters
├── scripts/
│   └── data/                  # Berka dataset importer
├── docs/
│   └── architecture/          # C4 diagrams
├── docker-compose.yml
└── README.md
```

**Directories:**
- `frontend/` — Angular SSR application with Material Design 3
- `services/` — Spring Boot microservices (auth, account, payment)
- `infrastructure/` — Azure Bicep modular infrastructure
- `scripts/data/` — Berka/PKDD'99 dataset importer and tools
- `docs/architecture/` — C4 model diagrams and deployment architecture

---

## Architecture

Architecture documentation uses the C4 Model (levels 1-3) with deployment and sequence diagrams.

See [docs/architecture/](docs/architecture/) for diagrams:

- C4 Level 1 — System Context
- C4 Level 2 — Container Diagram
- C4 Level 3 — Component Diagrams (auth, account, payment)
- Azure Deployment Diagram
- Sequence Diagrams (authentication, transfer, payment)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet                                  │
│                           │                                      │
│                           ▼                                      │
│                   ┌──────────────┐                               │
│                   │   Frontend   │                               │
│                   │   (Angular)  │                               │
│                   └──────┬───────┘                               │
│                          │ HTTPS                                 │
│                          ▼                                       │
│        ┌─────────────────────────────────────┐                   │
│        │   Azure Container Apps Environment  │                   │
│        │                                     │                   │
│        │  ┌────────────┐  ┌────────────┐    │                   │
│        │  │auth-service│  │account-    │    │                   │
│        │  │   :8081    │  │service     │    │                   │
│        │  └─────┬──────┘  │   :8082    │    │                   │
│        │        │         └─────┬──────┘    │                   │
│        │        │               │            │                   │
│        │        ▼               ▼            │                   │
│        │  ┌─────────────────────────────┐    │                   │
│        │  │      Azure Database         │    │                   │
│        │  │      for PostgreSQL         │    │                   │
│        │  └─────────────────────────────┘    │                   │
│        │                                     │                   │
│        │  ┌────────────┐                     │                   │
│        │  │payment-    │                     │                   │
│        │  │service     │                     │                   │
│        │  │   :8083    │                     │                   │
│        │  └─────┬──────┘                     │                   │
│        │        │ HTTP (internal)            │                   │
│        │        └───────────────►            │                   │
│        │                    account-service  │                   │
│        └─────────────────────────────────────┘                   │
│                                                                  │
│        ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│        │    ACR     │  │ Key Vault  │  │   Logs     │           │
│        │  (images)  │  │ (secrets)  │  │ (monitor)  │           │
│        └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

**Resources:**
- **Public:** Frontend (via Container Apps ingress)
- **Internal:** auth-service, account-service, payment-service
- **Data:** Azure Database for PostgreSQL
- **Secrets:** Azure Key Vault
- **Images:** Azure Container Registry
- **Monitoring:** Log Analytics / Azure Monitor

---

## Sequence Diagrams

### Authentication

```
User          Angular         auth-service      PostgreSQL
  │               │                │                │
  │   login       │                │                │
  ├──────────────►│                │                │
  │               │  POST /auth/login               │
  │               ├───────────────►│                │
  │               │                │  query user    │
  │               │                ├───────────────►│
  │               │                │  user data     │
  │               │                │◄───────────────┤
  │               │                │  verify BCrypt │
  │               │                │  generate JWT  │
  │               │  JWT token     │                │
  │               │◄───────────────┤                │
  │  token        │                │                │
  │◄──────────────┤                │                │
```

### Account Transfer

```
User          Angular         account-service    PostgreSQL
  │               │                │                │
  │   transfer    │                │                │
  ├──────────────►│                │                │
  │               │  POST /accounts/transfer        │
  │               ├───────────────►│                │
  │               │                │  validate      │
  │               │                │  debit source  │
  │               │                │  credit dest   │
  │               │                │  persist       │
  │               │                ├───────────────►│
  │               │                │  success       │
  │               │                │◄───────────────┤
  │               │  success       │                │
  │               │◄───────────────┤                │
  │  success      │                │                │
  │◄──────────────┤                │                │
```

### Payment Processing

```
User          Angular      payment-service   account-service   PostgreSQL
  │               │              │                │                │
  │   payment     │              │                │                │
  ├──────────────►│              │                │                │
  │               │ POST /payments               │                │
  │               ├─────────────►│                │                │
  │               │              │  create PENDING│                │
  │               │              │  persist       │                │
  │               │              ├───────────────►│                │
  │               │              │                │  POST /debit   │
  │               │              │                │  validate      │
  │               │              │                │  persist       │
  │               │              │                ├───────────────►│
  │               │              │                │  success       │
  │               │              │                │◄───────────────┤
  │               │              │  debit result  │                │
  │               │              │◄───────────────┤                │
  │               │              │  update status │                │
  │               │              │  COMPLETED/FAILED               │
  │               │              ├───────────────►│                │
  │               │  result      │                │                │
  │               │◄─────────────┤                │                │
  │  result       │              │                │                │
  │◄──────────────┤              │                │                │
```

---

## Microservices

| Service | Responsibility | Technology | Port |
|---------|----------------|------------|------|
| auth-service | Authentication, authorization, user management | Spring Boot, JWT, BCrypt | 8081 |
| account-service | Accounts, transfers, transaction history | Spring Boot, JPA, Flyway | 8082 |
| payment-service | Payment processing, debit requests | Spring Boot, RestClient | 8083 |
| frontend | Web UI, SSR, routing | Angular 21, Material 3 | 4200 |

---

## API Documentation

All backend services expose OpenAPI documentation:

- **auth-service:** http://localhost:8081/swagger-ui.html
- **account-service:** http://localhost:8082/swagger-ui.html
- **payment-service:** http://localhost:8083/swagger-ui.html

OpenAPI JSON available at `/v3/api-docs` on each service.

---

## Security

- **Spring Security** with JWT authentication
- **BCrypt** password hashing
- **Role-based access** (USER, ADMIN)
- **JWT propagation** between services (payment → account)
- **Azure Key Vault** for production secrets
- **Managed Identity** for Azure service authentication
- **Environment variables** for configuration
- **HTTPS** in production via Azure Container Apps

---

## Local Development

### Prerequisites

- Java 21
- Maven 3.9+
- Node.js 22+
- Docker & Docker Compose
- PostgreSQL (or use Docker Compose)

### Quick Start

```bash
# Start all services
docker compose up

# Access frontend
open http://localhost:4200
```

### Manual Start

```bash
# Start PostgreSQL
docker compose up postgres -d

# Start services (each in separate terminal)
cd services/auth-service && mvn spring-boot:run
cd services/account-service && mvn spring-boot:run
cd services/payment-service && mvn spring-boot:run

# Start frontend
cd frontend && npm start
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | coop |
| `DB_USER` | Database user | coop |
| `DB_PASSWORD` | Database password | coop |
| `JWT_SECRET` | JWT signing secret | dev-secret-change-me |
| `ACCOUNT_SERVICE_URL` | Account service URL | http://localhost:8082 |
| `AUTH_SERVICE_URL` | Auth service URL | http://localhost:8081 |
| `PAYMENT_SERVICE_URL` | Payment service URL | http://localhost:8083 |

---

## Docker

Each application has its own Dockerfile with multi-stage build:

- **Frontend:** Node.js build + Nginx/Node SSR
- **Backend services:** Maven build + JRE 21

Docker Compose orchestrates the full local environment:

```bash
docker compose up          # Start all services
docker compose up -d       # Start in background
docker compose down        # Stop all services
```

Azure Container Registry stores production images.

---

## Testing

### Unit Tests

```bash
cd services/auth-service && mvn test
cd services/account-service && mvn test
cd services/payment-service && mvn test
```

### Integration Tests

Requires Testcontainers (Docker must be running):

```bash
mvn verify -Pintegration-tests
```

### Contract Tests

```bash
mvn verify -Pcontract-tests
```

### End-to-End Tests

```bash
# Requires full stack running
mvn verify -Pe2e-tests
```

### Volume Tests

```bash
# Import Berka dataset
./scripts/data/import-berka.sh full

# Run volume validation
./scripts/data/volume-test.sh
```

---

## Infrastructure as Code

Azure Bicep manages infrastructure with modular design:

```
infrastructure/
├── main.bicep                    # Main orchestrator
├── modules/
│   ├── acr.bicep                # Container Registry
│   ├── container-app-environment.bicep
│   ├── frontend-container-app.bicep
│   ├── auth-container-app.bicep
│   ├── account-container-app.bicep
│   ├── payment-container-app.bicep
│   ├── postgres.bicep           # PostgreSQL
│   ├── key-vault.bicep          # Key Vault
│   ├── identities.bicep         # Managed Identity
│   └── monitoring.bicep         # Log Analytics
└── parameters/
    └── dev.bicepparam           # Development environment
```

**Principles:**
- `main.bicep` only composes modules
- Each module has single responsibility
- Secrets never in versioned parameters
- Environment-specific via `.bicepparam` files

---

## Azure Deployment

```bash
# Deploy infrastructure and applications
./scripts/deploy.sh
```

**Process:**
1. Bicep validates and deploys Azure resources
2. Docker images built and pushed to ACR
3. Container Apps updated with new images
4. Services restart with zero downtime

**Resources created:**
- `rg-coop-dev` — Resource Group
- `acrcoopdev` — Container Registry
- `cae-coop-dev` — Container Apps Environment
- `ca-coop-{service}-dev` — Container Apps
- `psql-coop-dev` — PostgreSQL
- `kv-coop-dev` — Key Vault

---

## Project Status

**Stage:** MVP Development

**Completed:**
- 001-010: Core functionality (auth, accounts, payments, frontend)
- 011: Testing (unit, integration, contract, E2E)
- 012: Bicep infrastructure
- 013: Azure deployment script
- 014: Observability (actuator, correlation IDs)
- 015: Berka dataset importer
- 016: Volume testing

**Remaining:**
- 017: Documentation (this document)
- 018: Out of scope
- 019: Final criteria

---

## Dataset

This project uses the Berka/PKDD'99 financial dataset for testing and demonstration.

**Source:** PKDD'99 Discovery Challenge (https://sorry.vse.cz/~berka/challenge/pkdd1999/)

**Usage:** Import via `./scripts/data/import-berka.sh` — not loaded automatically.

See [scripts/data/README.md](scripts/data/README.md) for details.
