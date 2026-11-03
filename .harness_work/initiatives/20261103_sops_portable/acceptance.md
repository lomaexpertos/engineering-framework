# Alcance y aceptación

Integrar la especificación portable del usuario en las autoridades existentes,
breve y por progressive disclosure. No implementar importadores/materializadores,
descifrar, inspeccionar homes, generar claves, operar servidores ni copiar el origen.

| Requisito del usuario | Cobertura a revisar |
| --- | --- |
| RF-001 | Autoridad única, routers e instrucciones; proyectos solo documentan mapa propio. |
| RF-002 | Identidad exacta HOME/.config/sops/age/keys.txt, home real, POSIX/WSL, 0700/0600, propietario, sin symlinks ni build/mounts. |
| RF-003 | Solo ruta canónica; ausencia/privada incorrecta/quórum sin búsquedas, chat, claves nuevas o cambio de recipients; archivo nuevo puede usar pública sin privada. |
| RF-004 | Ejecutores fijan selección interna; HOME/XDG/env/flags no redirigen ni agregan claves; fixtures aislados y sintéticos. |
| RF-005 | Públicas por unidad, regla SOPS y coherencia; no recipient propio ni updatekeys por alta de variable o privada ausente. |
| RF-006 | Entrada HOME/.config/sops/inputs/servicio.VARIABLE: valor único, permisos, preservar espacios, omitir un LF/CRLF, rechazar NUL/saltos internos. Asistente importa sin chat/argv/logs; borrar solo entrada verificada recuperable; conservar si falla y nunca borrar identidad. |
| RF-007 | Ciphertext, manifiesto exacto y sanitizado REDACTED coherentes; consumidor declara lectura/validación/obligatoriedad/defaults; raíces y destinos inequívocos. |
| RF-008 | Alta, rotación sin churn, renombre compatible, eliminación considerando rollback y archivo nuevo con valores reales. |
| RF-009 | Usar SOPS, preservar otros valores sin revelarlos, detener concurrencia, no plaintext/entradas en checkout ni valores prestados de otros servicios. |
| RF-010 | Gates ordenados: consumidor, claves, cifrado/recipients, descifrado/preservación, materializar --check, publicar conjunto, activar afectados, salud/flujo; pendientes visibles, alcance explícito. |
| RF-011 | Materializador usuario operativo, staging y runtime privados canónicos, unidad única, conjunto atómico y recuperación completa; app sin claves age, CI build sin claves ni valores de app. |
| RF-012 | Usuario deposita archivos, asistente realiza resto autorizado; cierre solo nombres, validación y estados commit/publicación/activación sin valores. |

Conservar explicación de dos capas criptográficas y distinción entre clave interna,
identidad age y rotación de credencial. Grupos/umbrales requieren quórum documentado;
el check actual solo soporta age directo, sin demostrar esa cobertura por documentación.

Validación: fuente/lint en Docker, consumidor con guías distribuidas y mutaciones
negativas, regresión de contrato SOPS estático con fixtures sintéticos y revisión
independiente. Los criterios operativos del texto se convierten en obligaciones de
adopción/pruebas del proyecto; no afirmar que el harness tiene esos ejecutores ni
que elimina sus overrides. Mantener VERSION 0.1.0 unreleased.
