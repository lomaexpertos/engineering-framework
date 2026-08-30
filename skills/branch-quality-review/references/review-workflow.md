# Flujo de revisión

## 1. Resolver modalidad y objetivo

Clasificar la solicitud:

- rama contra base;
- PR, commits o patch;
- revisión dirigida por ruta, módulo, flujo, proveedor, activo o preocupación;
- repositorio completo.

En revisión dirigida, no exigir un diff. Usar la petición como consulta semántica y construir el conjunto de archivos inspeccionando rutas, símbolos, tablas, endpoints, jobs, eventos, configuraciones y pruebas relacionados.

Conservar textualmente el énfasis del usuario y traducirlo a presets. Ejemplo: “Stripe, actualización de saldos e inventarios” activa `payments-financial`, `critical-state-integrity`, `data-contracts-transactions`, seguridad y pruebas de alto rigor; añadir `webhooks-event-ingestion` y `async-distributed` sólo si se detectan webhooks, callbacks, jobs o fronteras asíncronas.

## 2. Preparar evidencia Git

Para rama o commits, usar según aplique:

- `git status --short`
- `git branch --show-current`
- `git symbolic-ref refs/remotes/origin/HEAD`
- `git merge-base <base> HEAD`
- `git log --oneline --decorate <base>..HEAD`
- `git diff --stat <base>...HEAD`
- `git diff --name-status <base>...HEAD`
- `git diff <base>...HEAD -- <ruta>`

Inferir la base desde `origin/HEAD`, metadata del PR y convenciones. Preguntar sólo si sigue ambigua y cambia conclusiones.

En revisión dirigida sobre `main`, registrar `Modalidad: dirigida`, `Rama: main` y describir las rutas y símbolos incluidos; no fabricar un rango vacío como si fuera el alcance.

## 3. Entender contexto y riesgo

Identificar:

- objetivo funcional y criterios conocidos;
- activos: dinero, inventario, identidad, datos, documentos, permisos o disponibilidad;
- autoridad de cada dato e invariante;
- entradas públicas y fronteras de confianza;
- persistencia, motor, aislamiento y constraints;
- proveedores, webhooks, jobs, colas y efectos externos;
- contratos públicos y consumidores;
- volumen, despliegue, migración y recuperación.

Leer `engineering/`, la raíz `database/` cuando exista y los demás archivos raíz relevantes. No asumir que el diff explica el negocio completo.

## 4. Construir el radio de impacto

Para cada símbolo o dato crítico tocado, buscar:

- callers y rutas de entrada;
- todos los escritores, incluidos jobs, CLI, imports, triggers y scripts;
- lectores que dependan de semántica, estado, moneda, unidad o nulabilidad;
- eventos producidos y consumidores;
- tablas, constraints, índices, migrations, backfills, repairs y routines bajo `database/`;
- pruebas y fixtures;
- configuración, feature flags y rollout.

Detener la expansión cuando exista evidencia suficiente para sostener o descartar el riesgo. No convertir una revisión dirigida en auditoría ilimitada sin necesidad.

## 5. Seleccionar presets y rigor

Leer `risk-routing-and-presets.md`. Activar los presets base y todos los disparados por señales. Registrar:

| Preset | Activación | Activos o rutas | Rigor |
|---|---|---|---|
| ... | usuario / automática | ... | baseline / standard / high-assurance |

Si no puede determinarse si un preset aplica, investigarlo antes de marcarlo `no-aplicable`.

## 6. Revisar y validar

Revisar primero integridad, seguridad, contratos y recuperación; después performance, arquitectura, UX y mantenibilidad.

Ejecutar pruebas, análisis estático, linters o consultas diagnósticas sólo cuando sean seguras, estén dentro del alcance y usen la infraestructura oficial y aislada del proyecto. No cambiar configuración, bajar gates ni instalar dependencias en el host para obtener verde.

Tratar resultados automáticos como evidencia, no como sustituto del análisis. Si no pueden ejecutarse, registrar causa y riesgo residual.

## 7. Consolidar

Agrupar una causa compartida con ejemplos representativos. No duplicar el mismo problema por cada archivo.

Para cada control aplicado sin hallazgo, conservar evidencia suficiente para demostrar que se revisó. Para cada incertidumbre material, usar `no-verificable`, explicar qué falta y quién podría resolverlo.

## 8. Cerrar

Emitir una decisión limitada al alcance:

- `no-entregable`
- `entregable-con-reservas`
- `entregable-en-el-alcance-revisado`

No declarar seguridad absoluta ni ausencia de defectos. Indicar siempre alcance, evidencia y limitaciones.
