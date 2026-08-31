# Formatos de definición

Crear sólo los artefactos que aporten información real. `spec.md` es la autoridad del TO-BE; los documentos auxiliares conservan evidencia y comparación sin duplicar requisitos.

## `as-is.md`

```markdown
# AS-IS de la iniciativa

## Alcance investigado
## Fuera de alcance
## Comportamiento observado
## Actores, estados y reglas
## Datos, dependencias e integraciones
## Problemas y limitaciones
## Evidencia y confianza
## Vacíos de conocimiento
```

Registrar rama, commit, fecha, zona horaria y cambios locales relevantes. Distinguir `observado`, `confirmado`, `inferido` y `pendiente`. Si existe arquitectura vigente, referenciarla y documentar sólo verificaciones o diferencias propias de la iniciativa.

## `best-practices.md`

```markdown
# Best Practices consideradas

## Alcance y contexto
## Obligaciones verificadas
## Estándares y prácticas recomendadas
## Variantes y condiciones de aplicación
## Aplicabilidad a la iniciativa
## Riesgos y limitaciones
## Fuentes, vigencia y confianza
```

Clasificar cada afirmación como obligación verificada, estándar reconocido, práctica recomendada, variante habitual o hipótesis. Una salida de IA sin fuente suficiente permanece como hipótesis; no presentarla como verdad global ni decisión del proyecto.

## `brechas.md`

```markdown
# Análisis de brechas

- ID: BR-001
  Aspecto: ...
  AS-IS: ...
  Best Practice: ...
  TO-BE decidido: ...
  Brecha de implementación: ...
  Desviación residual: ...
  Estado: pendiente | aprobada | diferida | descartada | fuera-de-alcance | cubierta
  RF relacionados: RF-001 | no aplica
  Riesgo o dependencia: ...
  Evidencia y fuentes: ...
```

No tratar la brecha `AS-IS → Best Practice` como alcance automático. Mantener estados y referencias a RF actualizados sin convertir `brechas.md` en una segunda spec.

## `spec.md`

Usar este núcleo y añadir secciones condicionales donde ayuden:

```markdown
# <Título claro>

## Resumen
## Problema a resolver
## Objetivo
## Alcance
## Fuera de alcance
## Reglas de negocio
## Requisitos funcionales
## Casos principales
## Criterios de aceptación
## Riesgos
## Supuestos
## Impacto esperado
```

Secciones condicionales recomendadas: síntesis y enlaces del AS-IS, Best Practice y brechas; actores; datos y estados; casos borde; permisos y seguridad; integraciones; compatibilidad; requisitos no funcionales; observabilidad y criterios medibles de éxito.

Folio de requisito:

```markdown
- RF-001: <comportamiento concreto y verificable>.
```

## `preguntas.md`

```markdown
# Preguntas abiertas

## <Categoría>

- ID: P-001
  Estado: pendiente
  Pregunta: ...
  Por qué importa: ...
  Impacto si cambia: ...
  Respuesta o decisión: pendiente
```

Estados: `pendiente`, `respondida` o `descartada`. Clasificar por alcance, datos, UX, NFR, seguridad, integraciones, casos borde, restricciones o terminología.

## `checklist.md`

Incluir checks para alcance, exclusiones, RF, reglas, aceptación, casos borde, datos y estados, permisos, integraciones, compatibilidad, NFR y preguntas relevantes. Cuando existan artefactos auxiliares, comprobar además evidencia del AS-IS, clasificación y fuentes de Best Practice, disposición de brechas y cobertura RF de las brechas aprobadas. Marcar sólo lo respaldado por los artefactos; no usar el checklist como sustituto del contenido.
