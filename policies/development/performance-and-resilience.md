# Performance and resilience

## Requirements

1. Una optimización **MUST** partir de una métrica y línea base reproducibles; **MUST NOT** afirmarse una mejora solo por intuición.
2. Timeouts, concurrencia, lotes y reintentos **MUST** estar acotados cuando consuman recursos compartidos o llamen dependencias externas.
3. Una caché **MUST** definir clave, vigencia, invalidación y comportamiento ante datos ausentes u obsoletos.
4. Los cambios **MUST** preservar corrección, seguridad y contratos aunque reduzcan latencia o costo.
5. Riesgos de carga, degradación, backpressure y recuperación **SHOULD** evaluarse proporcionalmente al impacto esperado.
6. Rutas que procesen colecciones **SHOULD** evitar consultas o I/O por elemento,
   fan-out sin límite y transferencias innecesarias. La corrección debe usar batching,
   joins, eager loading u otra operación set-based sólo cuando el patrón y volumen
   reales lo justifiquen.
