# Organizational Skill design

## Criterion

La Skill define nuestras restricciones, el resultado esperado y las nomenclaturas,
convenciones o formas de realizar el trabajo propias del estilo organizacional.
El modelo decide cómo alcanzarlo dentro de ellas.

## Requirements

1. Una Skill **MUST** aportar un contrato organizacional o un límite de autoridad
   concreto, con trigger y resultado distinguibles. **MUST NOT** existir únicamente
   para enseñar técnicas generales de programación, debugging, investigación o revisión.
2. Las normas **MUST** tener autoridad canónica en Policies; la Skill las consulta
   por el perfil afectado y **MUST NOT** copiar sus manuales ni redefinir contratos.
3. Nombres, rutas, formatos de entrega y secuencias aprobadas del equipo **MUST**
   conservarse. El modelo **MAY** elegir técnicas, herramientas y orden no fijados por
   esos contratos; esa libertad **MUST NOT** usarse para ignorar una Policy.
4. Un procedimiento detallado **MAY** mantenerse cuando implemente un protocolo
   propio o una operación frágil cuya secuencia tenga una razón concreta de seguridad.
   No prescribir cuestionarios, puntuaciones, plantillas de respuesta o recetas
   universales sin una necesidad organizacional explícita.
5. Referencias **SHOULD** contener contratos propios sustanciales y condicionales,
   no contenido genérico desplazado desde `SKILL.md` para aparentar concisión.
6. El routing **MUST** cargar únicamente contratos pertinentes. Tocar un tema
   **MUST NOT** activar auditorías completas, plataformas ni artefactos adicionales
   ajenos al alcance. Una referencia entre Skills no autoriza esas acciones.
7. La depuración **MUST** conservar límites de autorización, protección de secretos,
   integridad y validación, además del logging crítico de
   [`../development/logging.md`](../development/logging.md). Su aparente familiaridad
   para el modelo no justifica retirarlos.
8. Un retiro **MUST** dejar visibles el contenido eliminado y el destino de los
   contratos conservados, actualizar sus callers y verificar la distribución.

Detalles reales de un proyecto —comandos, arquitectura, reglas de negocio y
excepciones aprobadas— pertenecen a su documentación canónica; no a una copia
corporativa particular de cada Skill.
