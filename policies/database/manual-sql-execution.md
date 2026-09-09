# Manual SQL execution

## Contract

1. Un artefacto manual **MUST** declarar motor, versión, orden, prechecks, aplicación, validación, recuperación y resultado esperado.
2. DDL y DML **SHOULD** separarse en pasos identificables cuando tengan riesgos, locks o estrategias de recuperación diferentes; esa separación no exige archivos distintos.
3. Una transacción **MUST** abarcar la invariante que pretende proteger y **MUST NOT** prometer atomicidad para operaciones que el motor confirma implícitamente.
4. PostgreSQL permite DDL transaccional en muchos casos, pero operaciones no compatibles con transacción **MUST** identificarse y aislarse.
5. En MySQL/MariaDB, el comportamiento de autocommit o commit implícito de DDL **MUST** verificarse para la versión real; un `ROLLBACK` textual **MUST NOT** presentarse como recuperación si el motor ya confirmó el DDL.
6. Operaciones largas **SHOULD** dividirse en lotes reanudables con límites, orden estable y observación de locks.
7. El paquete **MUST NOT** incluir credenciales ni asumir acceso productivo; la ejecución requiere autoridad externa al artefacto.
