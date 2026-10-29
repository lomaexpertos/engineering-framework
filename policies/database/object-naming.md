# Database object naming

## Requirements

1. Las columnas PK y FK **MUST** terminar en `_id` y usar el singular semántico de la entidad representada.
2. Constraints e índices **MUST** tener nombres estables y semánticos conforme a la convención existente; si no existe, usar prefijos `pk_`, `fk_`, `uq_`, `ck_` e `idx_` seguidos del objeto y columnas relevantes.
3. Vistas, funciones, procedimientos y triggers **SHOULD** usar respectivamente `vw_`, `func_`, `proc_` y `trg_`, salvo una convención canónica diferente del proyecto.
4. Nombres genéricos como `misc`, `data`, `temp`, `new` o `final` **MUST NOT** utilizarse para objetos permanentes sin semántica adicional.
5. Tablas, columnas y objetos no obvios **SHOULD** incluir comentarios que expliquen semántica, unidades, fuente o restricciones; el comentario **MUST NOT** repetir solamente el nombre.
