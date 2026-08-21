# Despliegue — Azure y Terraform

```mermaid
flowchart TB
    TF[Terraform]

    subgraph AppsRG[rg-coop-scus-dev · South Central US]
        ACR[ACR]
        Identity[Managed Identity]
        Apps[Container Apps Environment<br/>Frontend + 3 APIs]
        Shared[Key Vault + Observabilidad]
    end

    subgraph DbRG[rg-coop-db-brazil · Brazil South]
        DB[(PostgreSQL Flexible Server)]
    end

    Actions[GitHub Actions] -->|Push de imágenes| ACR
    TF -.->|Administra| Apps
    TF -.->|Administra| DB
    Identity -.->|AcrPull| ACR
    ACR -->|Imágenes| Apps
    Apps -->|JDBC| DB
```

Terraform adopta los recursos existentes mediante `imports.tf` y los protege con `prevent_destroy`. GitHub Actions actualiza las imágenes; Terraform administra la forma de la infraestructura sin revertir esas etiquetas.
