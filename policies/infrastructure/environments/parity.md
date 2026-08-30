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
5. La paridad de motores, extensiones y restauraciones de base de datos **MUST** cumplir
   [`../../database/deployment-compatibility.md`](../../database/deployment-compatibility.md).
