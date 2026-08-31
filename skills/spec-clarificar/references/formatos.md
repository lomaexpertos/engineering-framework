# Formatos de clarificación

## Pregunta

```markdown
## <Categoría>

- ID: P-001
  Estado: respondida
  Pregunta: ...
  Por qué importa: ...
  Impacto si cambia: ...
  Respuesta o decisión: ...
```

Estados:

- `pendiente`: falta una decisión con impacto posible;
- `respondida`: la decisión fue integrada en `spec.md`;
- `descartada`: ya no aplica y se explica el motivo.

No eliminar preguntas antiguas salvo duplicados exactos. Marcar como descartadas las que queden obsoletas.

## Clarificación

```markdown
# Clarificaciones

## YYYY-MM-DD HH:mm <zona-horaria>

- Pregunta: P-001
  Decisión: ...
  Evidencia o fuente: usuario | arquitectura | código | best-practice | otra
  Impacto en spec: Reglas de negocio y RF-002.
  Impacto en brechas: BR-001 pasa a cubierta.
```

Mantener la bitácora breve. La decisión completa debe vivir también en `spec.md`; `clarificaciones.md` conserva trazabilidad, no una segunda especificación.

Cuando cambie una brecha, conservar en `brechas.md` su ID y actualizar TO-BE, estado, RF y desviación residual. No sobrescribir el AS-IS ni la fuente de Best Practice para hacerlos coincidir con la decisión.

## Categorías

Usar sólo las aplicables: alcance, datos, UX, requisitos no funcionales, seguridad y permisos, integraciones, casos borde, restricciones y terminología.
