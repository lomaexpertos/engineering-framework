# Database routine safety

## Requirements

1. Funciones, procedimientos y triggers **MUST** declarar entradas, salidas, efectos, errores, permisos y comportamiento transaccional.
2. La lógica **MUST** pertenecer a una autoridad canónica; **MUST NOT** duplicar reglas divergentes de la aplicación.
3. SQL estático y operaciones set-based **SHOULD** preferirse; SQL dinámico **MUST** parametrizarse y justificarse.
4. Triggers **MUST** evitar recursión, efectos ocultos no documentados y trabajo externo no transaccional.
5. Rutinas con privilegios elevados **MUST** fijar contexto seguro, validar invocadores y conceder el mínimo acceso necesario.
6. Reentrancia, concurrencia, nulidad, duplicados y fallo intermedio **MUST** probarse cuando sean relevantes.
