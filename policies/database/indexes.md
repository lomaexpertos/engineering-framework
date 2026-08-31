# Database indexes

## Requirements

1. Un índice **MUST** responder a una consulta, constraint o patrón de acceso observado; **MUST NOT** crearse solo por intuición.
2. Orden de columnas, selectividad, filtros y cobertura **MUST** corresponder al patrón real de búsqueda, join u ordenamiento.
3. Todo índice **MUST** evaluar costo de escritura, almacenamiento y solapamiento con índices existentes.
4. Una FK **SHOULD** tener soporte de índice cuando sus joins, validaciones o acciones referenciales lo requieran.
5. Una optimización **MUST** comparar plan y resultado antes/después en un entorno seguro con datos representativos.
