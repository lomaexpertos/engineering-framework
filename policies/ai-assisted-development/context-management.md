# Context management

## Requirements

1. `AGENTS.md` **MUST** funcionar como router compacto y **MUST NOT** duplicar manuales, catálogos completos o procedimientos extensos.
2. El agente **MUST** cargar primero el router más cercano y después únicamente las Policies, documentación y Skills relevantes para la tarea.
3. Un README de dominio **MUST** mantener routing por tipo de cambio y enlazar la fuente canónica de cada tema.
4. Una Skill **MUST** representar un workflow con trigger y resultado propios; una regla transversal aislada **MUST** residir en Policies.
5. Material de referencia voluminoso o condicional **SHOULD** vivir en `references/` y cargarse solo cuando el workflow lo requiera.
6. Dos documentos vigentes **MUST NOT** reclamar autoridad canónica sobre el mismo contrato sin una precedencia explícita.
