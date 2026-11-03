# Revisión independiente

Revisor: infra_consistency. Cobertura RF-001 a RF-012 de acceptance.md sin bloqueantes.
Revisó rutas, HOME real, permisos/ownership, selección determinista, nuevas entradas,
preservación y concurrencia, recipients, compatibilidad, gates y materialización.

Confirmó archivo nuevo con públicas sin privada y conservación de entrada si no puede
verificarse recuperabilidad. El perfil estático no acredita identidad/inputs/públicas,
materializadores ni grupos/umbrales. Distinción de capacidad actual explícita.
Comprobó recuperación/reutilización de data key en código oficial SOPS 3.13.3.

Se aplicó su precisión: validar tipos/propietario/permisos/ausencia de symlinks antes
de crear, chmod, importar o borrar, además de antes de leer/descifrar. Preparación
del espacio HOME y escritura runtime quedan separadas, sin ampliar destinos del deploy.
Los gates incluyen unidad solicitada, limpieza --check al fallar y recuperación de
conjunto/versión anterior. No se leyeron homes privados ni se ejecutó criptografía.
