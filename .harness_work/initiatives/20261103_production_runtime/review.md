# Revisión independiente

Revisor: infra_consistency, solo lectura. Sin bloqueantes pendientes.

Se confirmó que la regla previa exigía basename `runtime`, contradictorio con la
raíz solicitada. Se sustituyó para producción, conservando la regla no productiva.
La revisión cubrió ruta literal, identidad estable, overrides, symlinks, precheck,
permisos, ausencia de fallback, adopción explícita y límites del almacenamiento Docker.
Se corrigió su recomendación de precisar «archivo mutable gestionado directamente
por la automatización» en el caller de automation.

Los huecos restantes están en docs/governance/pending-decisions.md: identidad de
recursos, rutas Compose recomendadas, subestructura runtime, persistencia, operaciones
privilegiadas, previews y parámetros de salud/logs/retención. No se fijaron valores
sin decisión del responsable. La instrucción de no inventar convenciones persistentes
queda en infrastructure-change-safety.

La revisión acredita coherencia normativa y routing; no inspeccionó otros proyectos
ni certifica prechecks o rutas de un host. El check deployment no valida esas rutas.
