# Policies

Las Policies son documentos normativos: definen qué se **DEBE**, **NO SE DEBE**,
**SE RECOMIENDA** o **SE PERMITE** hacer. Utilizan `MUST`, `MUST NOT`, `SHOULD`,
`SHOULD NOT` y `MAY` cuando esa precisión aporta valor.

No describen el estado particular de un producto ni sustituyen un procedimiento
operativo. Cada Policy debe tener alcance, reglas, razones, excepciones y, cuando sea
posible, relación con controles automáticos.

Antes de aplicar reglas locales, consulta la Policy transversal de
[`precedence.md`](precedence.md).

## Router por dominio

| Tipo de cambio o riesgo | Router |
| --- | --- |
| Credenciales, cifrado, red, acceso, supply chain o respaldos | [`security/`](security/README.md) |
| Infraestructura, configuración, ambientes, despliegue u observabilidad | [`infrastructure/`](infrastructure/README.md) |
| Código, errores, logging, pruebas, dependencias o compatibilidad | [`development/`](development/README.md) |
| Esquema, migraciones, índices o integridad de datos | [`database/`](database/README.md) |
| UI, componentes, formularios, navegación o accesibilidad | [`frontend/`](frontend/README.md) |
| Ramas, commits, Pull Requests o higiene del repositorio | [`git/`](git/README.md) |
| Conducta de agentes, contexto, validación o mantenimiento documental | [`ai-assisted-development/`](ai-assisted-development/README.md) |

## Ciclo de vida

Una Policy solo es vigente cuando existe como documento normativo revisado y está
incluida en el artefacto de una versión publicada. Los temas marcados como planeados
en routers no constituyen reglas vigentes.
