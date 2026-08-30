# Environment parity

## Purpose

Definir paridad por capacidades necesarias, no por reproducción accidental de cada
detalle productivo.

## Requirements

1. Cada proyecto **MUST** declarar qué capacidades replica entre producción, local y
   preview: servicios, dependencias, red, proxy, storage y health checks.
2. Diferencias deliberadas **MUST** documentarse junto con su impacto sobre la validez
   de las pruebas.
3. Credenciales desechables, menor redundancia y datos sintéticos **MAY** diferir de
   producción cuando mantienen aislamiento y propósito.
4. Una estrategia productiva como blue/green **SHOULD NOT** reproducirse fuera de
   producción salvo que la prueba evalúe específicamente esa estrategia.
5. Cuando un ambiente restaure una base que depende de extensiones, tipos u operadores,
   **MUST** disponer de versiones compatibles y validar esas capacidades antes y
   después de la restauración.
6. Una comprobación de conectividad del motor **MUST NOT** considerarse evidencia de
   que una restauración terminó correctamente.
7. Un restore parcial **MUST** marcar el ambiente como fallido y conservar diagnóstico
   suficiente para destruirlo o repararlo explícitamente.
