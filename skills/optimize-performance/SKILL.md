---
name: optimize-performance
description: "Usar para diagnosticar y mejorar latencia, throughput, memoria, CPU, I/O o carga de base de datos con mediciones reproducibles. No usar para refactorizar por intuición sin un problema observado."
---

# Optimize Performance

Mejorar una métrica concreta sin cambiar silenciosamente el comportamiento.

## Workflow

1. Definir síntoma, escenario, presupuesto y métrica de éxito.
2. Obtener una línea base reproducible y registrar ambiente y datos utilizados.
3. Perfilar antes de atribuir la causa; distinguir CPU, memoria, I/O, red y base de
   datos.
4. Identificar el cuello dominante y formular una hipótesis verificable.
5. Aplicar el cambio más pequeño que ataque esa causa.
6. Medir nuevamente con el mismo escenario y comparar variabilidad.
7. Ejecutar pruebas funcionales para detectar regresiones de corrección.
8. Evaluar costo trasladado, degradación en otros percentiles y comportamiento bajo
   carga o caché fría.
9. Conservar instrumentation útil y documentar límites de la medición.

No afirmar mejora sin evidencia comparable. Si el cuello es una consulta concreta,
usar `optimize-database-query`.
