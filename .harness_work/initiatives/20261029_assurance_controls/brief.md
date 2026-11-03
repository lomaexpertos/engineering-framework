# Controles de secretos y contratos de infraestructura

## Objetivo y alcance

Integrar Gitleaks y validadores de deployment y contratos dotenv/SOPS al harness,
distribuidos, descubribles y proporcionales. Usuario autoriza implementar lo
necesario; commits frecuentes y push continúan autorizados.

## Aceptación

- Scopes security/deployment/secrets conectados a check.sh y consumidor instalado.
- Configuración propia assurance.json con schema y rutas seguras; discovery
  condicional, sin ejecutar nuevos controles por pedir context/documentation.
- Gitleaks pinned con reglas conocidas: árbol, índice y commits según modo,
  reporte sanitizado, rechazo de escaneo incompleto y sin bypass por configuración local.
- Deployment con schema preciso, estrategias, referencias y migraciones declaradas.
- Secretos con allowlist, claves exactas, placeholders, recipients de primera regla
  y encrypted:true real; no descifrar ni acreditar gates operativos no comprobados.
- Instalador explícito con hashes fijados, sin reemplazar herramientas personales.
- Guías/Policies/Skills distribuidas y validadas; pruebas positivas/negativas,
  consumidor nuevo y binarios oficiales reales sin secretos de proyectos.
- Revisión independiente funcional, seguridad y logging; UI/UX no aplican porque no
  hay interfaz ni recorrido de producto afectado.

## Plan y límites

Implementar por superficies independientes: deployment+YAML; secretos; Gitleaks.
Coordinador integra scopes, distribución, instalador, guías y pruebas consumidor.
Revisores cruzados verifican componentes que no implementaron. Revalidar hallazgos
y ejecutar suite completa con lint antes de consolidar y cerrar.
Fuera de alcance: SQL linter, deploy, descifrado, rotación, conexión a sistemas
reales, hooks/schedulers/Actions implícitos, migraciones de proyectos consumidores.
