# Corrección funcional, arquitectura y mantenibilidad

## Corrección antes que estilo

Reconstruir el comportamiento esperado desde solicitud, specs, documentación, pruebas y código existente. Verificar:

- camino feliz, límites, estados y transiciones;
- reglas e invariantes en la autoridad correcta;
- ausencia, cero, vacío, `null` y desconocido con semántica deliberada;
- cálculos, signos, unidades, redondeo y fechas;
- errores, cancelación, reversión y reapertura;
- efectos laterales obligatorios y opcionales;
- compatibilidad con callers y consumidores existentes.

No asumir que una prueba existente define correctamente el negocio si contradice evidencia más autoritativa. Marcar la discrepancia.

## Manejo de errores

Buscar:

- excepciones silenciadas o convertidas en éxito;
- `catch` demasiado amplio que impida rollback o retry correcto;
- errores esperados de negocio tratados como fallos internos o viceversa;
- pérdida de causa y contexto;
- recursos, archivos, conexiones o locks sin liberar;
- fallbacks que cambian silenciosamente la decisión del negocio;
- respuestas inconsistentes o que filtran detalles sensibles;
- efectos opcionales capaces de revertir el trabajo principal por accidente.

## Arquitectura proporcional

Verificar autoridad, cohesión y dirección de dependencias:

- reglas en controllers, UI o infraestructura sin protección común;
- dominio acoplado directamente a SDK, HTTP, ORM o framework sin necesidad;
- módulos que actualizan tablas internas de otro dominio;
- servicios con responsabilidades no relacionadas;
- listeners o callbacks que ocultan dependencias obligatorias;
- patrones ausentes cuando existe variación real;
- capas, interfaces, factories o repositories ceremoniales sin beneficio;
- estado global mutable o service locator.

No bloquear por preferencia arquitectónica. Exigir daño concreto: invariantes duplicadas, acoplamiento que rompe despliegue/pruebas, autoridad ambigua o cambio difícil de revertir.

## Mantenibilidad y señales de implementación sin criterio

Buscar:

- APIs, helpers, tablas o configuración inventados sin existir en el stack;
- ramas muertas, parámetros ignorados y valores mágicos;
- comentarios que prometen garantías ausentes;
- tests que replican la implementación y no detectan defectos;
- abstracciones genéricas para un solo caso estable;
- duplicación de una regla crítica con semánticas distintas;
- funciones extensas que mezclan validación, persistencia y efectos externos;
- deuda o complejidad ajena al alcance;
- código generado o copiado que usa otra versión del framework.

Revisar manifest, imports, tipos y documentación oficial local antes de afirmar que una API existe.

## Compatibilidad y regresión

Seguir callers, implementaciones y consumidores. Detectar cambios en:

- semántica aunque la firma permanezca igual;
- orden, default, nulabilidad y errores;
- side effects y momento del commit;
- visibilidad, permisos y scoping;
- configuración, feature flags y rollout;
- pruebas o fixtures que oculten un comportamiento anterior.

## Resultado

Priorizar bug, regresión, autoridad ambigua y estado inválido sobre naming o formato. Reportar un aspecto cosmético sólo si produce deuda o inconsistencia material no cubierta por tooling automático.
