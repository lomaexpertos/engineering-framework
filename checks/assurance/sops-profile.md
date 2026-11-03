# Perfil estático SOPS/dotenv

Consultar al configurar `.sops.yaml` o ampliar el check `secrets`.
La autoridad normativa es [SOPS/age](../../policies/security/sops-age.md).

El control instalado de dotenv cifrado admite recipients nativos age declarados como
CSV o lista en `age`, sin `key_groups`, Shamir ni proveedores adicionales. Usa la
primera `creation_rule` aplicable, no la unión de todas las reglas. `path_regex` se
interpreta sobre la ruta relativa al repositorio, con `/`. Patrones y rutas de
ciphertext deben ser ASCII imprimible. El perfil admite anclas `^`/`$`, alternancia,
grupos simples, clases ASCII sin anidación, rangos, comodín `.` y cuantificadores
`*`, `+`, `?`. Solo se permiten escapes de puntuación/metacaracteres; no admite
`(?...)`, conteos `{n}`, clases POSIX, backreferences ni escapes alfabéticos como
`\A`, `\z`, `\p` o `\s`. Esta restricción evita seleccionar otra regla por diferencias
entre Go/RE2 y JavaScript.

Patrones inválidos o que excedan el tiempo de evaluación fallan la comprobación.
Una política `.sops.yaml` anidada junto al ciphertext o en sus directorios padres
también falla: el perfil no ignora una autoridad más cercana para aprobar otra.
El perfil comprueba que cada valor de variable permanezca cifrado, aunque una regla
SOPS permita cifrado selectivo. No acredita otros formatos, proveedores o quórums.

El check no necesita identidad privada y no valida ruta/permisos de identidades o
entradas, archivos `.age.pub`, preservación mediante descifrado, materializadores
ni activación. El proyecto debe comprobar esas obligaciones con fixtures sintéticos
y gates autorizados. Publicar documentación no elimina overrides de sus ejecutores
ni demuestra cumplimiento operativo. Operación: [guía de assurance](README.md).
