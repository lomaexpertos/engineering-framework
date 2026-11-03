# Revisión independiente de seguridad y logging

Revisor: secret_contract_check. Alcance de solo lectura sobre secret-scan,
tool-install, pins, pruebas e integración; esta es la única escritura del encargo.
El revisor no implementó los componentes examinados.

## Veredicto

Sin bloqueantes pendientes tras corregir y revalidar cuatro defectos de cobertura.
Las correcciones no modifican el índice ni referencias del repositorio inspeccionado.

## Defectos detectados y revalidados

| Escenario que antes podía aprobar incorrectamente | Protección comprobada |
| --- | --- |
| Archivo cambiado con assume-unchanged o skip-worktree en modo changes | Rechaza las flags con error explícito y conserva el índice. |
| refs/replace ocultaban un commit con token histórico | Desactiva reemplazos para Git y Gitleaks; detecta el token y conserva las referencias. |
| HEAD separado sin referencias omitía el escaneo histórico | Examina HEAD y su ascendencia en history y el rango solicitado en changes. |
| Nombre de archivo Linux con byte no UTF-8 se transformaba en ruta inexistente | Rechaza la ruta sin acreditar cobertura parcial. |

La revalidación independiente ejecutó las reproducciones acotadas con Gitleaks
8.30.1 real y terminó con código 0. Se usó exclusivamente un token sintético con
forma reconocible, generado dentro de repositorios temporales propios. Ningún
valor de prueba apareció en los resultados devueltos.

SHA256 del código comprobado antes y después de las reproducciones:
`61526bc1bbb9a7f4f7732c91e32fd252b6608e729bd797ee7b7d7a91769e4661`.

También terminó correctamente la ejecución independiente de
`HARNESS_TEST_GITLEAKS=/tmp/engineering-harness-assurance-bin/gitleaks node tooling/test-secret-scan.mjs`.

## Inspección adicional

- Se capturan stdout/stderr de procesos. Las salidas públicas omiten Match, Secret,
  líneas de código y patches; solo exponen regla, línea, ruta y etapa.
- Snapshots y reportes temporales quedan bajo directorio privado y se limpian al
  finalizar. Los archivos usan permisos restrictivos.
- Argv literal, configuración propia, ignore vacío y desactivación de comentarios
  allow evitan que configuración local silencie hallazgos.
- La ejecución falla ante herramientas faltantes, versión inesperada, timeout,
  discrepancia de reporte/código de salida y otros casos de cobertura incompleta.
- El instalador explícito descarga por HTTPS, verifica SHA256 fijado y usa creación
  exclusiva del destino. No sustituye ejecutables personales ni symlinks existentes.
- No se encontró exposición de valores en diagnósticos ni defecto demostrado de
  sobrescritura del instalador. La integración instalada tiene pruebas de guías,
  config inválida, scopes independientes y herramientas faltantes.

## Límites

La detección cubre el alcance Git declarado y los patrones del scanner; no acredita
que no exista ningún secreto posible ni acceso seguro a sistemas externos. Las
rutas con U+FFFD se rechazan conservadoramente, aunque ese carácter pudiera existir
en un nombre UTF-8 válido. No se certificaron binarios en otros sistemas operativos
o arquitecturas; la comprobación funcional real fue Linux x64.

No se ejecutaron deployments, aplicaciones ni acceso a secretos reales. La suite
completa integrada corresponde al coordinador y se registra por separado.
