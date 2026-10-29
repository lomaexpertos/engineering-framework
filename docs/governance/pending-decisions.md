# Pendientes de evolución

Estos temas no constituyen contratos implementados ni autorizaciones de ejecución.

## Compatibilidad y adopción

- Extender la validación de clientes a flujos reales de adopción y subagentes.
  Discovery de instrucciones y skills tiene smoke reproducible con CLI reales;
  no equivale a certificar comportamiento de modelos, GUI ni providers productivos.
- Adoptar un consumidor real con reconciliación explícita de contexto heredado; el
  actualizador nunca traslada su documentación por su cuenta.
- Extender los adaptadores de ejecución a Pi y nuevas versiones cuando exista
  evidencia de su contrato; mantener explícita la diferencia entre integración
  de CLI y comportamiento de modelos en proyectos reales.
- Resolver skills homónimas instaladas globalmente en equipos adoptados, sin borrarlas
  como efecto de actualizar un proyecto.

## Contratos especializados

- Metadata normativa de Policies y formato verificable de excepciones, conservando
  los datos mínimos y aprobación definidos por la Policy de precedencia.
- Adoptar validadores de deployment y dotenv/SOPS en proyectos reales; ampliar
  formatos/proveedores con contratos comprobados. Los checks estáticos no sustituyen
  descifrado autorizado, activación, restauración ni validación operativa de ambientes.
- Ampliar adaptadores de linters por stacks usados en proyectos reales, sin imponer
  un analizador único ni instalar dependencias del producto en el host.
- Completar normas organizacionales de IaC, contenedores, red, cifrado general,
  control de acceso y restauración cuando existan decisiones propias verificables.
- Definir por motor y proyecto las versiones/extensiones soportadas, representación
  física de UUID, charset/collation y defaults temporales/transaccionales; las
  convenciones compartidas de PostgreSQL/MySQL no fijan esas elecciones.
- Precisar TTL y responsable de previews, objetivos de recuperación de datos y
  servicio (RPO/RTO), y periodicidad de pruebas de restauración.
- Aclarar el alcance de «valor productivo» en la Policy de configuración frente a
  valores públicos comunes declarados por ambiente; el aislamiento de secretos y
  recursos productivos sigue vigente.
- Delimitar rutas y autoridad cuando la instalación requiera escribir fuera del
  repositorio y de `RUNTIME_DIR`, por ejemplo configuración del sistema o servicios
  del host; los helpers privilegiados no amplían autorización por sí solos.

## Operación y distribución

El canal central y los workflows de Actions continúan suspendidos. Restaurarlos
requiere decisión y validación aparte; los helpers conservados no equivalen a soporte
operativo vigente para 2.x. `projects.yml` no dispara instalaciones.

La actualización local usa manifest de hashes para integridad; no aporta firmas del
publicador. Una evolución de autenticidad de releases requiere un contrato adicional.
No hay scheduler de purga ni plataforma de observabilidad central incluida.
