# Desarrollo y pruebas

## Requisitos

- Java 21.
- Node.js 22+ y npm.
- Docker con Docker Compose.
- Maven 3.9+ o los wrappers incluidos.

## Inicio rápido

```bash
docker compose up --build
```

La aplicación queda disponible en `http://localhost:4200`. Para detenerla:

```bash
docker compose down
```

## Ejecución manual

```bash
docker compose up postgres -d

(cd services/auth-service && ./mvnw spring-boot:run)
(cd services/account-service && ./mvnw spring-boot:run)
(cd services/payment-service && ./mvnw spring-boot:run)
(cd frontend && npm ci && npm start)
```

Cada proceso debe ejecutarse en una terminal distinta.

## Configuración

| Variable | Uso | Valor local predeterminado |
|---|---|---|
| `SPRING_DATASOURCE_URL` | JDBC de los backends | `jdbc:postgresql://localhost:5432/coop` |
| `SPRING_DATASOURCE_USERNAME` | Usuario PostgreSQL | `coop` |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña PostgreSQL | `coop` |
| `JWT_SECRET` | Firma de JWT | Solo desarrollo |
| `ACCOUNT_SERVICE_URL` | Destino usado por pagos | `http://localhost:8082` |
| `AUTH_SERVICE_URL` | Proxy SSR de autenticación | `http://localhost:8081` |
| `PAYMENT_SERVICE_URL` | Proxy SSR de pagos | `http://localhost:8083` |

Los valores predeterminados son exclusivamente locales.

## Pruebas

```bash
(cd services/auth-service && ./mvnw test)
(cd services/account-service && ./mvnw test)
(cd services/payment-service && ./mvnw test)
(cd frontend && npm test)
```

Las pruebas de integración usan Testcontainers y requieren Docker. El E2E de `payment-service` está deshabilitado por defecto porque necesita el stack completo.

## Dataset de volumen

El dataset Berka/PKDD'99 es opcional y no se carga automáticamente:

```bash
./scripts/data/import-berka.sh full
./scripts/data/volume-test.sh
```

Los detalles del mapeo y los volúmenes están en [scripts/data/README.md](../scripts/data/README.md).
