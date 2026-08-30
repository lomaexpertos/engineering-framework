# Método de investigación

## Delimitar

Definir la pregunta que debe responder la documentación y el nivel de cobertura:

- flujo: una operación o proceso concreto;
- submódulo: conjunto cohesivo de capacidades;
- módulo: límites, datos y flujos principales; o
- dominio: mapa de módulos y relaciones, seguido de cortes documentales.

Registrar qué queda fuera. En alcances amplios, crear un inventario inicial y declarar
la cobertura como completa, parcial o no revisada.

## Seguir el comportamiento

Partir de puntos de entrada reales: rutas, comandos, pantallas, jobs, eventos o
procesos batch. Seguir el flujo hasta sus efectos persistentes y externos:

- actores y permisos;
- precondiciones e invariantes;
- decisiones y transiciones de estado;
- lecturas y escrituras;
- transacciones, concurrencia y consistencia;
- eventos, colas, integraciones y efectos secundarios; y
- errores, reintentos, reversas y reconciliación.

Buscar pruebas que confirmen casos alternos y límites. No deducir todo el comportamiento
desde nombres de clases o tablas.

## Documentar datos

Registrar tablas o almacenes usados, lectura o escritura, propósito, autoridad,
relaciones y estados relevantes. No copiar el DDL completo ni convertir el documento
en catálogo de columnas.

Usar una Skill de base de datos solo si además se solicita modificar objetos; este
flujo permanece descriptivo.

## Trazar dependencias

Distinguir:

- entrantes y salientes;
- directas e indirectas; y
- obligatorias, opcionales o eventualmente consistentes.

Documentar contrato, propósito y fallo. No confundir cercanía conceptual con
acoplamiento técnico.

## Explicar decisiones

Usar historia Git, ADR, comentarios, pruebas y documentación solo cuando aporten
evidencia del motivo. Registrar contexto, decisión, razón conocida y consecuencias. Si
solo se observa la implementación, marcar el motivo como desconocido o inferido.

## Controlar calidad

Buscar contradicciones entre documentación, decisiones confirmadas, código, pruebas y
esquema. Conservar la discrepancia hasta determinar qué fuente tiene autoridad sobre la
intención y cuál describe el comportamiento ejecutable. Evitar afirmaciones universales
basadas en una sola ruta o prueba.
