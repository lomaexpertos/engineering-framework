# Plantillas de trabajo

Usar estas plantillas de forma selectiva. No mostrar todos los artefactos ni todos los campos en cada interacción.

## Contenido

1. Tarjeta de aprendizaje
2. Nodo del mapa de dominio
3. Pregunta de descubrimiento
4. Regla de negocio
5. Registro acumulativo
6. Comparación AS-IS / Best Practice / TO-BE / brechas
7. Delimitación por etapas
8. Matriz de preparación
9. Resumen de transferencia

## Tarjeta de aprendizaje

```markdown
### <Tema>

- Idea esencial:
- Por qué existe:
- Por qué importa en este proyecto:
- Ejemplo:
- Variante o contraejemplo:
- Error común:
- Debo poder responder:
- Evidencia o fuente:
- Decisiones relacionadas:
```

## Nodo del mapa de dominio

```markdown
| Tema | Prioridad | Relación con el objetivo | Estado de comprensión | Siguiente acción |
|---|---|---|---|---|
| ... | Fundamental / Importante / Contextual / Avanzado / No aplicable | ... | Desconocido / Parcial / Suficiente | Estudiar / Confirmar / Decidir / Aplazar |
```

## Pregunta de descubrimiento

```markdown
- ID: P-001
  Pregunta: ...
  Tipo: estudio / cliente / usuario / especialista / proyecto
  Por qué importa: ...
  Decisión o riesgo afectado: ...
  Responsable: ...
  Evidencia solicitada: ...
  Momento: bloquea ahora / resolver después / fuera de alcance
  Estado: abierta / respondida / descartada
  Respuesta y confianza: ...
```

## Regla de negocio

```markdown
- ID: RN-001
  Categoría: principio del dominio / regla externa verificada / hecho del cliente / decisión del proyecto
  Enunciado: Si <condición>, entonces <resultado>.
  Razón o riesgo que controla: ...
  Excepciones: ...
  Evidencia o fuente: ...
  Fecha o versión aplicable: ...
  Confianza: confirmado / probable / incierto / desconocido
```

## Registro acumulativo

```markdown
### Glosario
- Término: definición acordada y contexto.

### Hechos confirmados
- Hecho — evidencia — responsable — fecha.

### Hipótesis
- Hipótesis — por qué parece plausible — cómo confirmarla — impacto si es falsa.

### Decisiones
- Decisión — responsable — razón — alternativas — consecuencias — fecha.

### Preguntas abiertas
- ID — pregunta — dueño — bloqueo — siguiente acción.

### Riesgos
- Riesgo — causa — consecuencia — señales — tratamiento propuesto.

### Fuentes
- Fuente — autoridad — fecha consultada — vigencia — qué respalda.

### Alcance
- Núcleo / etapa actual / siguiente etapa / futuro / fuera de alcance.
```

## Comparación AS-IS / Best Practice / TO-BE / brechas

```markdown
| Aspecto | AS-IS observado | Best Practice sustentada | TO-BE decidido | Brecha de implementación | Desviación residual | Evidencia/confianza |
|---|---|---|---|---|---|---|
| Actor y responsabilidad | ... | ... | ... | ... | ... | ... |
| Evento y flujo | ... | ... | ... | ... | ... | ... |
| Regla o control | ... | ... | ... | ... | ... | ... |
| Excepción | ... | ... | ... | ... | ... | ... |
| Datos y evidencia | ... | ... | ... | ... | ... | ... |
| Integración | ... | ... | ... | ... | ... | ... |
```

Registrar por separado la brecha de referencia `AS-IS → Best Practice`, la brecha de implementación `AS-IS → TO-BE` y la desviación residual `TO-BE → Best Practice`. No inferir que todo el referente forma parte del alcance.

## Delimitación por etapas

```markdown
| Capacidad | Clasificación | Valor | Riesgo de excluir | Dependencias | Costo de agregar después | Razón |
|---|---|---|---|---|---|---|
| ... | Núcleo / Actual / Siguiente / Futuro / Fuera | ... | ... | ... | Bajo/Medio/Alto + motivo | ... |
```

## Matriz de preparación

Calificar con `0 desconocida`, `1 parcial` o `2 suficiente para esta etapa`.

```markdown
| Dimensión | Nivel | Evidencia del nivel | Vacío o supuesto | ¿Crítico? | Siguiente acción |
|---|---:|---|---|---|---|
| Problema y objetivo | | | | | |
| Actores y responsabilidades | | | | | |
| Flujo y estados | | | | | |
| Reglas y cálculos | | | | | |
| Excepciones y recuperación | | | | | |
| Datos y evidencias | | | | | |
| Integraciones y conciliación | | | | | |
| Auditoría, seguridad y fraude | | | | | |
| Regulación aplicable | | | | | |
| Alcance y dependencias | | | | | |
| Criterios de aceptación | | | | | |
```

No sumar puntos como único criterio. Un cero crítico impide el paso aunque el total parezca alto.

## Resumen de transferencia

```markdown
# Comprensión del dominio: <tema y etapa>

## Problema y resultado
## Actores y responsabilidades
## Flujo, estados y evidencias
## Reglas confirmadas
## Variantes elegidas y descartadas
## Excepciones de mayor impacto
## Reglas externas y fuentes
## Decisiones del cliente y del proyecto
## Alcance de la etapa
## Supuestos y límites
## Preguntas pendientes con dueño
## Riesgos
## Evaluación de preparación
```
