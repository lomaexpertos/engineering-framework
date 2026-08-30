---
name: security-review
description: "Usar para revisar autenticación, autorización, secretos, exposición, entrada no confiable, criptografía, dependencias o límites de confianza con enfoque explícito de seguridad."
---

# Security Review

Evaluar amenazas explotables y controles reales con evidencia del sistema.

## Workflow

1. Definir activo, alcance, actores, datos sensibles y límites de confianza.
2. Inspeccionar autenticación, autorización por recurso, sesiones y credenciales.
3. Seguir entradas no confiables hasta validación, persistencia, ejecución y salida.
4. Revisar inyección, traversal, SSRF, XSS, CSRF, uploads y deserialización según aplique.
5. Revisar secretos, cifrado, logs, errores, backups y artefactos de build.
6. Evaluar dependencias y configuración usando evidencia vigente disponible.
7. Comprobar aislamiento, least privilege, rate limits y abuso de flujos sensibles.
8. No reportar una amenaza hipotética como vulnerabilidad confirmada sin camino
   alcanzable.
9. Priorizar por explotabilidad, impacto y exposición.

## Salida

Por hallazgo: severidad, activo, precondiciones, ruta de ataque, evidencia, impacto y
mitigación. Separar confirmados, riesgos de diseño y verificaciones pendientes. No
intentar explotación destructiva ni acceder a secretos.
