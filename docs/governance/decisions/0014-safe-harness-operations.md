# ADR-0014: Operaciones recuperables y descubrimiento acotado

- Estado: Aceptada.
- Fecha: 2026-10-28.
- Sucesor parcial: [ADR-0015](0015-native-harness-runtime.md) sustituye la imagen del runtime del harness por Node nativo en 3.x; conserva las protecciones operativas.

## Contexto

Un harness comparte el host con otros proyectos y puede actualizarse entre sesiones.
Una interrupción no debe perder trabajo propio del consumidor, y reducir contexto
no debe ocultar las restricciones que siguen aplicando.

## Decisiones y razones

- Cada archivo administrado se prepara y persiste antes de reemplazar su destino
  mediante rename atómico. La operación multiarchivo mantiene journal recuperable;
  no promete una transacción de filesystem que la plataforma no proporciona.
- Recuperar exige reconocer contenido previo o aplicado y conservar ediciones
  posteriores. Un archivo desconocido nunca se convierte en descartable por estar
  dentro del núcleo. Las extensiones pertenecen a su namespace local explícito.
- No se recorren carpetas heredadas para limpiar directorios fuera del inventario.
  Dejar un directorio vacío es preferible a asumir ownership de contenido ajeno.
- Check y trabajo ejecutan el ID inmutable de la imagen que construyeron. Un tag
  compartido derivado solo del Dockerfile no identifica su código y puede cambiar
  entre proyectos concurrentes.
- Los perfiles limitan discovery, conservando el núcleo metodológico y las fuentes
  normativas completas. Las skills locales generan nombres `project-*` para evitar
  colisiones y mantienen una fuente editable separada de sus adaptadores.
- El presupuesto considera nombres, descripciones y rutas de cada plataforma; no
  se presenta una medida de caracteres como conteo exacto de tokens.
- Cerrar conserva una revisión semántica explícita. Comprobar hashes, existencia de
  fuentes o una transición de estado no demuestra por sí solo que una explicación
  de negocio sea correcta o que todo el conocimiento haya sido promovido.

## Consecuencias

Una divergencia requiere revisión y reparación explícita. Un lock desconocido no
se rompe automáticamente. El diagnóstico puede exigir intervención local para
preservar datos, en lugar de continuar ciegamente.

Los detalles operativos vigentes están en
[distribución](../../architecture/distribution.md) y
[ciclo de vida](../../architecture/work-lifecycle.md).
Esta decisión complementa [ADR-0013](0013-project-harness.md), sin autorizar publicación,
schedulers o acceso a servicios productivos.
