# Evidencia y límites

Implementación normativa: 0b780bc. Requisitos originales y alcance en acceptance.md.
La política de entrada enlaza material privado y contrato dotenv; los detalles del
parser se cargan desde checks/assurance/sops-profile.md. No se copian procedimientos
de un producto ni rutas privadas personales. AGENTS fuente 62 líneas, plantilla 56.

Dentro de engineering-harness-validation:monorepo, target validation del Dockerfile,
Node 22.19.0 Alpine 3.22 por digest, sin red, UID/GID del operador y source read-only:

- validate-framework con cambios distribuidos y VERSION sin modificar; lint-source:
  fuente, syntax JS/Bash, ShellCheck/shfmt e higiene aprobados. evidence/validation.log.
- test-guide-check: instalación de consumidores y perfiles, recursos de ambos clientes,
  inventario/routing y mutaciones negativas. Misma evidencia; no ejecución de modelos.
- test-secret-contract: fixtures sintéticos del protocolo SOPS, listas, claves,
  recipients y errores. No se requirió identidad real ni acceso productivo.
- test-distribution: instalación/actualización/recuperación/ownership aprobados;
  evidence/distribution.log. Los 3.0.0 del log son fixtures aislados hipotéticos,
  no un incremento de la versión real 0.1.0 unreleased.
- validate-framework tras precisar permisos y gates: evidence/final-source.log.

Revisión independiente en review.md; criterios RF-001 a RF-012 mapeados en acceptance.md.
El escaneo real usa engineering-harness-validation:monorepo-security y Gitleaks 8.30.1
para archivos/índice; resultado en evidence/secret-scan.log, sin afirmar historial total.
El motor de cierre escribe solamente este expediente con montaje de escritura.

No se han implementado importador o materializador real, modificado ejecutores de
consumidores ni probado nuevas operaciones de cifrado/descifrado. El check existente
no comprueba permisos/rutas privadas, entrega de valores, archivos de públicas,
preservación real, materialización o activación: la adopción exige esas pruebas
en proyectos, usando exclusivamente fixtures sintéticos y gates autorizados.
