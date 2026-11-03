# Revisión funcional independiente

Revisor: agente monorepo_review. Ámbito: cambio integrado de Policies, Skill,
referencias, routing y controles de guías. Resultado: sin bloqueantes pendientes.

Hallazgo corregido: el ejemplo inicial de semantic-release usaba el parser Angular
por defecto, pero prometía reconocer `!` como ruptura. Ahora configura
`conventionalcommits` en análisis y notas, declara dependencia compatible y exige
comprobar el contrato de ruptura.

Escenarios revisados:

- API PHP y worker Python en producto nuevo, sin publicar: apps independientes,
  raíces nativas, Docker, identidad/release por app y límites de activación claros.
- Cambio de etiqueta en app existente: no activa adopción ni pipeline completo.
- Instalación/adopción: sin mover legado, modificar archivos propios, publicar o
  habilitar Actions por instalar el harness.
- Documentación, SQL e infraestructura conservan autoridades/rutas existentes.
- Referencias internas reubicables para ambos clientes; Policies se encuentran desde
  raíz del consumidor, sin enlaces relativos que se rompan al copiar la Skill.
- Releases, artefactos, previews y producción distinguen confianza, selección de
  afectados, limpieza y recuperación parcial.

La revisión acredita coherencia documental, no ejecución de semantic-release,
GitHub Actions, plugins ni previews reales. No hay cambios a UI ni runtime productivo.

Delta de validación revisado después: declarar curl 8.14.1-r4 en Dockerfile satisface
el prerrequisito ya usado por el fixture de setup. Conserva usuario no root y las
pruebas intactas; sin bloqueantes. Imagen reconstruida y tres suites de setup aprobadas.
