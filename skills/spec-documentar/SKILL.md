---
name: spec-documentar
description: "Preserva como referencia permanente el estado actual de un módulo, dominio, submódulo, proceso o flujo con evidencia trazable del repositorio. Usar para crear o actualizar una línea base reutilizable en engineering/ después de investigar o implementar; no usar para el AS-IS limitado a una iniciativa."
---

# Spec Documentar

Preservar conocimiento verificable para acelerar cambios futuros sin obligar a
redescubrir el sistema. Describir el estado actual (`AS-IS`) como línea base
reutilizable, no una solución futura.

## Frontera y seguridad

- Escribir únicamente documentación permanente bajo `engineering/architecture/` o la
  ruta canónica equivalente ya establecida por el proyecto.
- No modificar código, configuración, datos ni artefactos de `engineering/specs/`.
- Realizar inspección de solo lectura. No consultar producción ni servicios externos
  sin autorización explícita.
- Reportar defectos o inconsistencias detectados; no corregirlos dentro de este flujo.
- Mantener los documentos en español salvo una convención explícita del proyecto.
- No crear un expediente permanente solo porque una iniciativa necesite investigar su
  punto de partida. Ese AS-IS local pertenece a `spec-analizar` o `spec-definir`.

## Identificar el alcance

Tratar `engineering/architecture/` como namespace predeterminado y crear un expediente
con slug estable:

```text
engineering/architecture/index.md
engineering/architecture/<YYYYMMDD_nombre_descriptivo>/
```

Usar la fecha de creación en la zona horaria del proyecto o, si no existe, la del
entorno. Mantenerla al actualizar el mismo expediente. Escribir el nombre en
`snake_case`, con minúsculas, números y guiones bajos, sin espacios, acentos ni `ñ`.
Reutilizar el slug de la spec de origen cuando ya cumpla la convención. Si otro
expediente distinto usa el mismo nombre y fecha, añadir `_02`, `_03` o el siguiente
consecutivo. No renombrar expedientes legados por iniciativa propia.

Para un dominio amplio, crear primero `cobertura.md` y dividir la investigación por
módulos o flujos. Elegir la granularidad después de conocer volumen y acoplamiento; no
presentar una revisión parcial como documentación completa.

## Investigar con evidencia

Leer [metodo-investigacion.md](references/metodo-investigacion.md) antes de analizar el
repositorio. Priorizar:

1. documentación permanente vigente del mismo alcance;
2. puntos de entrada, casos de uso y reglas de dominio;
3. migraciones, modelos, consultas y tablas;
4. APIs, eventos, jobs, colas e integraciones; y
5. permisos, pruebas, configuración e historial Git cuando expliquen una decisión.

Clasificar afirmaciones relevantes como:

- `observado`: respaldado por código, configuración, esquema o prueba;
- `confirmado`: decisión del usuario o documentación autoritativa;
- `inferido`: conclusión razonable sin evidencia explícita de intención; o
- `pendiente`: dato importante que no pudo determinarse.

Referenciar rutas y símbolos concretos. Registrar commit, rama, fecha, zona horaria,
estado limpio o sucio del árbol y cambios locales que afecten la cobertura. No inventar
el motivo de una decisión.

Si no existe evidencia suficiente, detenerse sin crear un snapshot vacío y solicitar
la fuente necesaria.

## Crear el snapshot

Leer [estructura-documental.md](references/estructura-documental.md) y crear solo
archivos con contenido real. Para cualquier alcance, crear:

- `resumen.md`: alcance, propósito, vigencia, cobertura y verificación; y
- `mapa-de-codigo.md`: fuentes relevantes y su responsabilidad.

Según corresponda, añadir:

- `flujos.md`;
- `modelo-de-datos.md`;
- `dependencias.md`;
- `decisiones.md`;
- `cobertura.md`; y
- `pendientes.md`.

Usar identificadores estables como `FL-001` y `DEC-001`. Preservar el ID cuando
represente la misma semántica; asignar uno nuevo si cambia y registrar el reemplazo.
Incluir Mermaid solo cuando aclare relaciones verificables.

## Mantener el índice

Crear o actualizar `engineering/architecture/index.md` con:

- módulos, dominios, procesos y límites documentados;
- snapshots disponibles y recomendado por tema;
- estado `vigente`, `requiere-revision` o `historica`;
- fecha, zona horaria y commit de última verificación; y
- cobertura pendiente.

No borrar snapshots anteriores. Marcar reemplazados como históricos e indicar su
sucesor. No elegir automáticamente una fuente ante contradicciones: conservar la
discrepancia hasta identificar la autoridad correcta.

## Integración con Specs

Después de `spec-implementar`, crear o actualizar documentación cuando cambien
materialmente invariantes, procesos, flujos, estados, datos, contratos, eventos, jobs,
permisos o dependencias. Cambios cosméticos o internos sin efecto permanente no lo
requieren.

`spec-analizar`, `spec-planear` y `spec-implementar` deben consultar primero el índice. Si un
snapshot vigente cubre el área y coincide con el comportamiento actual, reutilizarlo y
verificar directamente solo las zonas tocadas, inciertas o desactualizadas.

## Cierre

- Comprobar que la cobertura declarada coincide con lo inspeccionado.
- Separar hechos, decisiones, inferencias y pendientes.
- Validar enlaces y rutas.
- Confirmar que el índice apunta al snapshot correcto.
- Listar archivos creados o modificados y vacíos de conocimiento relevantes.
