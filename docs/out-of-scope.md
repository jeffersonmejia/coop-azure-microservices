# Alcance Fuera del MVP

Este documento define las capacidades que NO están implementadas en el MVP de Coop EC.

Estas capacidades pueden plantearse posteriormente.

---

## Servicios Financieros

| Capacidad | Estado | Notas |
|-----------|--------|-------|
| Pagos reales | No implementado | Solo simulación con estados PENDING/COMPLETED/FAILED |
| Tarjetas | No implementado | No hay gestión de tarjetas de crédito/débito |
| Transferencias bancarias externas | No implementado | Solo transferencias internas entre cuentas del sistema |
| SWIFT | No implementado | No hay integración con red SWIFT |
| ACH | No implementado | No hay integración con ACH |
| Conciliación bancaria | No implementado | No hay proceso de conciliación |
| Créditos | No implementado | No hay otorgamiento de créditos |
| Préstamos | No implementado | No hay gestión de préstamos |
| Interés financiero | No implementado | No hay cálculo de intereses |
| Inversiones | No implementado | No hay productos de inversión |

---

## Seguridad

| Capacidad | Estado | Notas |
|-----------|--------|-------|
| MFA | No implementado | Solo autenticación JWT simple |
| OAuth2 externo | No implementado | No hay integración con Google, Facebook, etc. |

---

## Infraestructura

| Capacidad | Estado | Notas |
|-----------|--------|-------|
| Redis | No implementado | No hay caché distribuido |
| Kafka | No implementado | No hay message broker |
| Service Bus | No implementado | No hay servicio de mensajería Azure |
| API Management | No implementado | No hay gateway de APIs |
| AKS | No implementado | No hay Kubernetes gestionado |
| Kubernetes manual | No implementado | Container Apps en su lugar |
| Service mesh | No implementado | No hay Istio, Linkerd, etc. |

---

## Arquitectura

| Capacidad | Estado | Notas |
|-----------|--------|-------|
| CQRS | No implementado | Arquitectura CRUD convencional |
| Event Sourcing | No implementado | No hay store de eventos |

---

## Justificación

El MVP de Coop EC se centra en:

1. **Autenticación básica** — JWT con roles USER/ADMIN
2. **Gestión de cuentas** — Creación, saldo, transferencias internas
3. **Procesamiento de pagos** — Simulación con débito a cuenta
4. **Historial** — Transacciones y pagos paginados
5. **Frontend funcional** — Angular SSR con Material Design 3
6. **Infraestructura cloud** — Azure Container Apps con Bicep

Las capacidades fuera del MVP se omiten para:

- Reducir complejidad inicial
- Acelerar el tiempo de desarrollo
- Enfocarse en funcionalidades core
- Mantener costos bajos en desarrollo
- Permitir iteración rápida

---

## Futuras Expansiones

Cuando el MVP esté validado, se podrían considerar:

1. **MFA** — Para mayor seguridad
2. **OAuth2** — Para login social
3. **Kafka/Service Bus** — Para comunicación asíncrona
4. **Redis** — Para caché de sesiones y datos frecuentes
5. **API Management** — Para gestión centralizada de APIs
6. **Créditos/Préstamos** — Para productos financieros completos
7. **Conciliación** — Para sincronización con bancos reales
