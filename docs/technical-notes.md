# Notas técnicas

## Spring Boot 4.1

Durante la validación se corrigieron cambios de compatibilidad:

- `TestRestTemplate` usa `org.springframework.boot.resttestclient`.
- `HealthIndicator` y `Health` usan `org.springframework.boot.health.contributor`.
- Los records de Java no pueden declarar métodos estáticos con el nombre de uno de sus componentes.

## Orden de validación

1. Ejecutar cada servicio localmente para detectar errores de compilación y configuración.
2. Validar comunicación y dependencias con Docker Compose.
3. Desplegar en Azure cuando el stack local sea estable.

Los backends se compilan como imágenes nativas en GitHub Actions. La capacidad observada en Azure es `0.5` CPU y `1Gi` por Container App.
