# Dataset Berka / PKDD'99 para Coop EC

## Origen

Datos financieros del Competition PKDD'99, basados en operaciones reales de un banco checo entre 1993 y 1998.

Referencia: https://sorry.vse.cz/~berka/challenge/pkdd1999/

## Mapeo a Coop EC

| Berka | Coop EC |
|-------|---------|
| client | auth.users |
| account | accounts.accounts |
| disp | accounts.account_members |
| trans | accounts.account_transactions |
| order | payments.payments |

## Volumen

| Tabla | Registros |
|-------|-----------|
| users | 5,369 |
| accounts | 4,500 |
| account_members | 5,369 |
| account_transactions | ~1,056,320 |
| payments | 6,471 |

## Uso

### Datos de prueba

```bash
./scripts/data/import-berka.sh test
```

Carga 10 usuarios, 10 cuentas, 100 transacciones y 10 pagos para pruebas automatizadas.

### Dataset completo

```bash
./scripts/data/import-berka.sh full
```

Descarga y carga el dataset completo de Berka. Requiere conexión a internet la primera vez.

## Configuración

Variables de entorno:

- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 5432)
- `DB_NAME` (default: coop)
- `DB_USER` (default: coop)
- `DB_PASSWORD` (default: coop)

## Estructura

```
scripts/data/
├── import-berka.sh        # Orquestador principal
├── download-berka.sh      # Descarga dataset
├── transform.py           # Transformación Berka → Coop EC
├── indices.sql            # Índices optimizados
├── seed-test.sql          # Dataset de prueba
└── README.md              # Este archivo
```

## Notas

- Los datos se transforman para ajustarse al modelo de Coop EC
- Se generan credenciales sintéticas para usuarios de prueba
- El importador es idempotente: puede ejecutarse múltiples veces sin duplicados
- Los servicios no cargan estos datos automáticamente
- Los movimientos se almacenan en account_transactions, no en una tabla separada
