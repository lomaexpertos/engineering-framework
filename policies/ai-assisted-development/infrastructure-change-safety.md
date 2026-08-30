# Infrastructure change safety

## Purpose

Separar evaluación, planeación y ejecución para impedir que una solicitud informativa
se convierta en una modificación operativa no autorizada.

## Requirements

1. Una solicitud de lectura, evaluación o validación **MUST NOT** interpretarse como
   autorización para modificar archivos, infraestructura o servicios externos.
2. La evaluación inicial **MUST** ser read-only y **MUST NOT** descifrar secretos,
   ejecutar deployments ni alterar estado.
3. Antes de proponer una reorganización, el agente **MUST** inspeccionar instrucciones,
   estructura, ambientes, manifests, automatización, configuración, documentación y
   checks existentes.
4. El reporte **MUST** distinguir hechos observados, desviaciones, cambios propuestos y
   acciones que requieren autorización.
5. Autorizar planeación **MUST NOT** interpretarse como autorización de ejecución.
6. Una migración estructural **MUST** contar con plan aprobado, alcance, no-alcance,
   dependencias, orden, validación y rollback antes de mover archivos.
7. Operaciones destructivas, privilegiadas o externas **MUST** recibir autorización
   específica cuando no estén incluidas explícitamente en el alcance aprobado.
8. Adoptar documentación o Policies **MUST NOT** cambiar comportamiento operativo,
   rotar credenciales, reemitir certificados ni modificar tareas programadas.
9. El agente **MUST NOT** eliminar artefactos heredados únicamente porque parezcan
   redundantes; debe comprobar referencias y obtener la autoridad necesaria.
10. Durante la ejecución, cada fase **MUST** conservar trazabilidad con el plan y
    evidencia de validación antes de avanzar.

El procedimiento detallado de evaluación, generación y adopción pertenecerá a la Skill
`infrastructure-change`; esta Policy define únicamente sus límites obligatorios.
