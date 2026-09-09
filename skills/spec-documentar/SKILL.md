---
name: spec-documentar
description: Crea o actualiza la documentación canónica de un módulo ya existente o una funcionalidad ya implementada bajo engineering/docs/, explicando su comportamiento vigente, sus reglas y razones de negocio y su realización técnica. Usar cuando el usuario pida la documentación final, actual o fuente de verdad de un módulo, o después de una implementación validada que cambie materialmente ese conocimiento; no usar para propuestas futuras.
---

# Spec Documentar

Mantener una fuente de verdad de larga vida que permita comprender qué hace un módulo,
por qué funciona así y dónde se realiza técnicamente. Documentar el estado vigente, no
el proceso de trabajo ni una solución futura.

## Ubicación y autoridad

Escribir únicamente bajo:

```text
engineering/docs/index.md
engineering/docs/<modulo>/README.md
```

Usar para `<modulo>` un nombre estable en `snake_case`, sin fecha, espacios, acentos
ni `ñ`. Actualizar el documento existente en lugar de crear snapshots sucesivos; Git
conserva su historia.

`engineering/docs/<modulo>/README.md` es la referencia canónica del módulo. `index.md`
sólo permite encontrar cada módulo, conocer su alcance y enlazar dependencias entre
documentos. Si un repositorio tiene documentación legada en otra ubicación, leerla
como evidencia pero no moverla ni mantener dos autoridades por iniciativa propia;
dejar explícita la transición necesaria.

No modificar código, datos, specs ni planes como parte de esta Skill.

## Cuándo usarla

Usar esta Skill cuando:

- el usuario solicite documentar el funcionamiento actual o final de un módulo;
- una implementación ya validada cambie materialmente reglas, decisiones, flujos,
  estados, flags, configuraciones, datos, contratos, permisos o dependencias;
- la documentación canónica existente haya quedado desactualizada por un cambio
  comprobado.

Durante definición, consultar estos documentos como AS-IS. Durante planeación,
programar su actualización cuando corresponda. Escribirlos sólo después de que el
comportamiento exista y haya sido validado. No activar esta Skill por refactors
internos, cambios cosméticos ni notas transitorias.

## Construir la documentación

Delimitar el módulo o flujo y revisar evidencia suficiente en código, configuración,
esquema, pruebas y artefactos aprobados de la iniciativa. Verificar especialmente las
afirmaciones afectadas por el cambio; no redescubrir todo el sistema si el alcance es
claro.

Explicar, con las secciones que resulten útiles:

- propósito, límites, actores y vocabulario del módulo;
- proceso y reglas de negocio, incluidas excepciones y responsabilidades;
- decisiones relevantes y su motivo conocido;
- estados, transiciones, flags y configuraciones, indicando cuándo aplican y por qué;
- datos, contratos, permisos, integraciones y efectos operativos;
- componentes técnicos principales y dónde reside cada responsabilidad;
- limitaciones, discrepancias o preguntas que impidan afirmar algo con seguridad;
- fecha y commit contra los que se verificó el contenido.

Priorizar explicaciones duraderas sobre inventarios exhaustivos de clases, columnas o
líneas de código. Añadir diagramas o archivos separados, como `negocio.md`,
`flujos.md` o `tecnico.md`, sólo cuando hagan el contenido sustancialmente más claro;
enlazarlos desde el `README.md` y evitar duplicación.

No inventar razones históricas. Distinguir una decisión confirmada de una explicación
inferida. Si código, pruebas, documentación previa y decisiones aprobadas se
contradicen, señalar la discrepancia y determinar la autoridad antes de presentar el
documento como vigente.

## Cierre

Actualizar `engineering/docs/index.md` cuando cambie la cobertura o aparezca un módulo
nuevo. Antes de entregar, comprobar que la documentación describe el comportamiento
implementado, que conserva el contexto de negocio relevante y que sus rutas y
referencias son válidas.

Informar el módulo documentado, evidencia principal, commit de verificación, archivos
modificados y cualquier vacío que limite la cobertura.
