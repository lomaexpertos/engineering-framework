# Policy precedence

## Scope

Esta Policy aplica a todos los repositorios y a toda decisión cubierta por el
Engineering Framework.

## Requirements

1. Las Policies corporativas aplicables **MUST** tratarse como la línea base.
2. Las restricciones propias de un proyecto **MAY** ser más estrictas.
3. Una regla, documento o convención de proyecto **MUST NOT** debilitar una Policy
   corporativa sin una excepción explícita y aprobada.
4. La implementación existente y las preferencias del agente **MUST NOT** prevalecer
   sobre una Policy o restricción de proyecto aplicable.
5. Un conflicto **MUST** hacerse visible antes de tomar la decisión afectada; el
   agente **MUST NOT** inventar una resolución ni asumir aprobación tácita.
6. Cuando el comportamiento real contradiga una Policy, esa contradicción **MUST**
   reportarse. Su existencia no convierte el comportamiento en una excepción válida.

## Exceptions

Hasta que exista un workflow corporativo de excepciones, una excepción válida debe
quedar documentada en el repositorio consumidor y aprobada por el owner competente.
El registro **MUST** identificar como mínimo:

- Policy y requisito afectados;
- alcance y repositorios o componentes incluidos;
- justificación y riesgo aceptado;
- owner y referencia verificable de aprobación;
- controles compensatorios;
- fecha de expiración o revisión.

La excepción debe ser limitada. Una excepción de proyecto no modifica la fuente
corporativa ni constituye precedente para otros repositorios.

## Effective order

```text
Corporate Policies
        ↓
Approved exceptions and stricter project constraints
        ↓
Documented project architecture and conventions
        ↓
Agent preferences
```
