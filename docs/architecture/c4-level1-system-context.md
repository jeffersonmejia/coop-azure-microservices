# C4 Level 1 — System Context

```mermaid
graph TB
    subgraph "Actores"
        User["Socio /<br/>Usuario"]
    end
    
    subgraph "Sistema"
        CoopEC["Coop EC<br/>Aplicación Bancaria"]
    end
    
    subgraph "Infraestructura"
        Azure["Microsoft<br/>Azure"]
        Database["Database<br/>(PostgreSQL)"]
        External["Servicios<br/>Externos"]
    end
    
    User -->|"HTTPS"| CoopEC
    CoopEC --> Azure
    CoopEC --> Database
    CoopEC --> External
```

**Actores:**
- **Socio/Usuario:** Usuario final accediendo a la aplicación bancaria
- **Coop EC:** El sistema bancario cooperativo
- **Microsoft Azure:** Infraestructura cloud (Container Apps, ACR, Key Vault)
- **Database:** PostgreSQL para almacenamiento persistente
- **External Services:** Integraciones con terceros (futuro)

**Interacciones principales:**
- El usuario accede a Coop EC vía HTTPS
- Coop EC se ejecuta en Azure Container Apps
- Coop EC almacena datos en PostgreSQL
- Azure provee infraestructura, secretos y monitoreo
