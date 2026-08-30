# Datos, contratos, migraciones y escala

## Contenido

1. SQL y modelo de datos
2. Dinero, tiempo e identificadores
3. Contratos y compatibilidad
4. Migraciones y backfills
5. Performance y caché

## 1. SQL y modelo de datos

Revisar:

- SQL parametrizado y allowlists para identificadores dinámicos;
- cardinalidad de joins, `null`, agregaciones y filtros;
- N+1, consultas por elemento, selección excesiva y paginación estable;
- constraints que respalden invariantes estructurales;
- índices derivados de consultas, cardinalidad y planes reales;
- escrituras masivas con conjunto objetivo y filas afectadas verificables;
- callbacks, triggers o procedures que oculten efectos.

No asumir que una consulta corta es barata ni que `distinct` corrige un join semánticamente incorrecto.

## 2. Dinero, tiempo e identificadores

Comprobar:

- decimal o unidad mínima, nunca punto flotante binario para dinero;
- moneda, escala, redondeo y momento en que se aplica;
- unidades y conversiones;
- fecha civil, hora local, instante, UTC y zona cuando corresponda;
- DST, límites de periodo y fechas efectivas;
- fuente de reloj confiable;
- identificadores opacos, sin inferir permisos ni secuencia;
- alcance y semántica de folios, series y consecutivos.

## 3. Contratos y compatibilidad

Tratar como contratos públicos:

- endpoints y códigos de error;
- eventos y payloads;
- schemas, columnas y datos serializados;
- componentes y props compartidos;
- archivos importados/exportados;
- configuración consumida por despliegues independientes.

Buscar cambios silenciosos en nulabilidad, unidad, significado, enum, precisión, orden, defaults o campos. Exigir versionado, transición o compatibilidad cuando existan consumidores desplegados por separado.

## 4. Migraciones y backfills

Revisar:

- mecanismo de ejecución: framework o SQL literal manual;
- clasificación correcta bajo `database/migrations/`, `database/backfills/`, `database/repairs/` o `database/routines/` según el propósito;
- motor, versión y transaccionalidad de DDL;
- locks, reescritura, espacio, tiempo y replicación;
- expand/contract y orden de despliegue app/DB;
- datos históricos, valores nulos y defaults;
- índices o constraints creados sin bloquear indebidamente;
- backfills idempotentes o reanudables;
- lotes con clave estable y progreso;
- conteos y consultas de validación antes/después;
- rollback o roll-forward realista;
- triggers y doble escritura durante convivencia.

Para paquetes SQL manuales, revisar conjuntamente precheck, aplicación, validación y rollback cuando exista. Confirmar que un backfill complete o recalcule datos válidos, un repair corrija datos incorrectos y una routine represente un objeto permanente; no aceptar `migrations` como categoría genérica para cualquier script. Verificar que el SQL ejecutable permanezca fuera de `engineering/` y que la trazabilidad lo referencie sin duplicarlo.

Bloquear DDL destructivo sin autorización, backfills acumulativos duplicables o cambios incompatibles sin transición.

## 5. Performance y caché

Evaluar con volumen y distribución representativos:

- complejidad algorítmica, memoria y payload;
- fan-out de red, consultas y proveedores;
- límites de batch, upload, paginación y exportación;
- índices y plan de ejecución;
- thundering herd, cache stampede y trabajo duplicado;
- claves de caché con tenant, permisos, versión y filtros correctos;
- invalidación y tolerancia a stale data;
- costos externos por request;
- timeouts y límites de recursos.

No exigir optimizaciones especulativas. Reportar degradación probable en rutas críticas o falta de evidencia donde el volumen haga material el riesgo.
