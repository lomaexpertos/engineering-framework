---
name: implement-feature
description: "Implementa una capacidad de producto de extremo a extremo sin spec formal obligatoria; coordina código, contratos, pruebas y Skills de riesgo."
---

# Implement Feature

Entregar la capacidad solicitada dentro del estilo y los contratos del proyecto.

## Contrato de trabajo

- Localizar las Policies y la documentación del área afectada; conservar arquitectura,
  nomenclaturas, contratos y componentes vigentes. No exigir una spec formal para un
  cambio ad hoc; una spec aprobada y planificada usa `spec-implementar`.
- Aplicar `development/logging.md` desde el mismo cambio cuando se cree o modifique
  una operación crítica. El tamaño del diff no exime motores de cálculo, facturación,
  correcciones, autorizaciones ni efectos financieros o de integridad.
- Consultar [references/risk-routing.md](references/risk-routing.md) si el cambio
  cruza dominios; cargar contratos relevantes, no encadenar workflows completos
  únicamente por mencionar una tecnología.
- El modelo elige el diseño, orden de implementación y pruebas dentro de esas
  restricciones. No introducir otra arquitectura, plataforma o entregable ajeno.
- Actualizar documentación canónica solo ante cambios materiales. No generar
  reportes persistentes, checklists ni auditorías completas por defecto.

## Resultado esperado

Comportamiento completo y evidencia proporcional según `development/testing.md`.
En flujos críticos, demostrar que los eventos permiten reconstruir decisiones,
resultado y fallas; no entregar ese logging como una tarea futura.
Reportar resultado, validaciones y pendientes reales, sin narrar procedimientos internos.
