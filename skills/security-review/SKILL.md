---
name: security-review
description: "Audita autenticación, autorización, secretos, exposición, entradas no confiables, criptografía, dependencias y límites de confianza."
---

# Security Review

Entregar una auditoría de seguridad delimitada, con evidencia y sin correcciones implícitas.

## Contrato de revisión

- Aplicar las Policies de `security/` y los contratos de autenticación, autorización
  y exposición del proyecto. El modelo elige cómo examinar las superficies solicitadas.
- No presentar una amenaza hipotética como vulnerabilidad confirmada; distinguir
  hallazgo confirmado, riesgo de diseño y verificación pendiente.
- No modificar código, intentar explotación destructiva, acceder a secretos ni
  afectar servicios externos por el solo hecho de auditar.
- Si se revisan autorizaciones u otras operaciones críticas, comprobar la evidencia
  de logging exigida por `development/logging.md` sin recopilar datos sensibles.
- Una revisión de entrega completa usa `branch-quality-review`; no convertir
  esta auditoría focalizada en otra revisión de todo el repositorio.

## Resultado esperado

Por hallazgo: severidad, activo, precondiciones, ruta alcanzable, evidencia, impacto
y mitigación. Declarar límites y no generar documentos permanentes por defecto.
