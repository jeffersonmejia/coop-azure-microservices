# Fuera del alcance del MVP

Coop EC demuestra el flujo bancario interno de una cooperativa. No pretende operar como un core bancario productivo.

## Funcionalidad financiera

- Pagos reales y transferencias hacia otros bancos.
- Tarjetas, créditos, préstamos, inversiones e intereses.
- Integraciones SWIFT/ACH y conciliación bancaria.

## Seguridad y cumplimiento

- MFA y proveedores OAuth2 externos.
- KYC/AML, auditoría regulatoria y prevención de fraude.
- Gestión productiva del ciclo de vida de claves y secretos.

## Plataforma

- API Management, Redis y mensajería asíncrona.
- AKS, service mesh y arquitectura multirregión.
- Alta disponibilidad, recuperación ante desastres y SLA productivo.

## Arquitectura

- CQRS y Event Sourcing.
- Procesamiento distribuido de transacciones.
- Integraciones con sistemas financieros de terceros.

La implementación actual usa Angular SSR, tres microservicios Spring Boot, PostgreSQL, Azure Container Apps y Terraform.
