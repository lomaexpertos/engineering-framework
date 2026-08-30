# Formato del reporte

Crear un reporte trazable tanto para ramas como para revisiones dirigidas.

## Contenido

1. Estructura
2. Reglas
3. Ruta

## Estructura

```markdown
# Quality Review: <slug>

## Metadata

- Fecha:
- Modalidad: rama / PR / commits / patch / dirigida / repositorio
- Rama actual:
- Rama base y rango: <valor o no aplica>
- Commit HEAD:
- Objetivo solicitado:
- Nivel de rigor: baseline / standard / high-assurance
- Carpeta de reporte:

## Contexto detectado

- Stack y versiones:
- Motor y persistencia:
- Activos críticos:
- Invariantes identificadas:
- Entradas, escritores y consumidores relevantes:
- Integraciones y efectos externos:

## Presets activados

| Preset | Motivo de activación | Alcance inspeccionado |
|---|---|---|
| ... | usuario / evidencia automática | ... |

## Matriz de cobertura

| Preset o dominio | Estado | Evidencia | Limitación |
|---|---|---|---|
| ... | hallazgo / revisado-sin-hallazgos / no-aplicable / no-verificable | ... | ... |

## Resumen ejecutivo

- Decisión: no-entregable / entregable-con-reservas / entregable-en-el-alcance-revisado
- Riesgos principales:
- Cobertura y confianza:

## Hallazgos bloqueantes

### B1. <título>

- Severidad: Crítica / Alta
- Confianza: Alta / Media / Baja
- Preset:
- Evidencia:
- Escenario de fallo o abuso:
- Impacto:
- Dirección de corrección:
- Depende de:

## Hallazgos no bloqueantes

### M1. <título>

- Severidad: Media / Baja
- Confianza: Alta / Media / Baja
- Preset:
- Evidencia:
- Impacto:
- Dirección de corrección:
- Depende de:

## Preguntas y supuestos

- <pregunta o supuesto que pueda cambiar la conclusión>

## Validaciones ejecutadas

| Comando o revisión | Resultado | Evidencia |
|---|---|---|
| ... | pasó / falló / no ejecutado | ... |

## Plan de corrección ordenado

1. <seguridad o integridad que desbloquea lo demás>
2. <contratos, datos o fronteras>
3. <implementación y pruebas>
4. <validación y operación>

## Riesgos residuales y limitaciones

- <qué no se pudo verificar y por qué>
```

## Reglas

- No omitir la matriz aunque no existan hallazgos.
- No usar `no-aplicable` sin justificarlo cuando el preset fue activado por el usuario.
- No usar `revisado-sin-hallazgos` sin evidencia representativa.
- Agrupar una causa con ejemplos; no multiplicar hallazgos idénticos.
- Ordenar correcciones por dependencia y riesgo, no por facilidad.
- Limitar la decisión al alcance revisado.

## Ruta

```text
engineering/quality-review/<slug>/YYYY-MM-DD-HHMM-branch-quality-review.md
```

Usar exactamente `engineering/quality-review/<slug>/`. `engineering/quality-review/` es el namespace fijo; cada carpeta de expediente nueva debe usar:

```text
YYYYMMDD_nombre_descriptivo
```

El segmento descriptivo debe estar en `snake_case`, con minúsculas, números y guiones bajos, sin espacios, acentos ni `ñ`. La fecha corresponde a la creación del expediente y no cambia al agregar reportes posteriores. Reutilizar el slug de la spec relacionada cuando cumpla esta convención.

Ejemplo:

```text
engineering/quality-review/20260805_redisenar_corte_caja/2026-08-05-1730-branch-quality-review.md
```

Si el mismo nombre identifica otro expediente creado en la misma fecha, añadir `_02`, `_03` o el siguiente consecutivo. No renombrar desde esta skill expedientes legados: reutilizarlos únicamente cuando sea necesario para conservar su trazabilidad y registrar la excepción en `Metadata`.
