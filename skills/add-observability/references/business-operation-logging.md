# Business operation logging

Cargar esta referencia cuando una operación crítica, un cálculo o un flujo de varios
pasos deba poder reconstruirse mediante logs.

La Policy de logging cargada por la Skill es la autoridad sobre campos permitidos,
datos prohibidos, confiabilidad y costo. Esta referencia describe únicamente el método
para diseñar y comprobar la instrumentación.

## Workflow

1. Delimitar inicio, fin, resultado y fronteras de la operación.
2. Enumerar pasos de dominio, decisiones, efectos externos y puntos de fallo; evitar
   eventos por detalles internos que no explican el resultado.
3. Elegir un `operation_id` o `correlation_id` estable y propagarlo por todos los
   eventos, jobs, reintentos y servicios participantes.
4. Registrar inicio, checkpoints semánticos, finalización y fallo con nombres de
   evento estables.
5. Elegir para cada checkpoint únicamente los datos que permitan explicar la decisión
   o resultado conforme a la Policy.

## Validation

1. Probar éxito, fallo intermedio, reintento y ejecución concurrente.
2. Reconstruir un caso de prueba usando únicamente los eventos emitidos y contrastarlo
   con el estado transaccional.
3. Verificar que cada hecho se registre una sola vez y que todos los eventos conserven
   la correlación.
4. Confirmar que la instrumentación respete los límites de datos y confiabilidad de la
   Policy aplicable.
