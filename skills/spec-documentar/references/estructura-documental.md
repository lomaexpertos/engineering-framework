# Estructura documental

## `index.md`

Mantener `engineering/architecture/index.md` como navegación global corta:

- módulos, dominios, procesos, propósitos y límites;
- tabla de temas con snapshot recomendado;
- estado, fecha, zona horaria y commit;
- snapshots históricos y reemplazos; y
- cobertura pendiente.

Cada snapshot vive directamente en
`engineering/architecture/<YYYYMMDD_nombre_descriptivo>/`. No crear carpetas
intermedias que omitan el slug fechado.

## `resumen.md`

Incluir objetivo, slug, fecha de creación, alcance, no-alcance, cobertura, propósito,
actores, capacidades, invariantes, estados, riesgos, desconocidos, discrepancias,
rama, commit, fecha, hora, zona horaria y estado del árbol inspeccionado.

## `flujos.md`

Para cada `FL-###`, registrar nombre, propósito, disparador, actores, precondiciones,
pasos, decisiones, alternativas, estados, errores, reversas, reintentos, datos, efectos
y evidencia.

## `modelo-de-datos.md`

Describir entidades y tablas, autoridad, lectura o escritura, relaciones, estados,
integridad y retención. Señalar datos compartidos y accesos cruzados. Evitar inventarios
de columnas evidentes.

## `dependencias.md`

Separar dependencias entrantes, salientes, directas e indirectas. Documentar contrato,
propósito, obligatoriedad, sincronía, fallos y consumidores conocidos.

## `decisiones.md`

Para cada `DEC-###`, registrar estado de evidencia, contexto, decisión, motivo conocido,
alternativas documentadas, consecuencias y fuentes. No fabricar alternativas
retrospectivas.

## `mapa-de-codigo.md`

Relacionar rutas, símbolos, tablas, endpoints, eventos, jobs y pruebas con su
responsabilidad. Preferir símbolos estables sobre líneas y registrar el commit.

## `cobertura.md`

Para dominios o módulos amplios, inventariar módulos, procesos, flujos y dependencias
con nivel `completa`, `parcial` o `no revisada`. Indicar snapshot responsable y
siguiente corte recomendado. No usar porcentajes sin medición real.

## `pendientes.md`

Crear solo cuando existan preguntas, contradicciones, áreas no revisadas o evidencia
insuficiente. Indicar impacto y siguiente verificación concreta.
