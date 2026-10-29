# Preparación automática unificada del harness

Implementar una preparación unificada explícita: setup.sh instala/reutiliza
herramientas; setup.sh --check diagnostica sin escribir; check.sh --setup prepara
y valida con salida JSON limpia. Bootstrap inicial admite --setup sin Node previo.

Aceptación: Node22/24 desde PATH o cacheNodeoficial, Gitleaks/SOPS resueltos
automáticamente sin editar PATH/perfiles; versiones y hashes fijados; idempotencia,
permisos/owner, locks, contenido desconocido preservado, guías y distribución.
Pruebas sintéticas y reales sin dependencias preexistentes ni credenciales de producto.

Coordinador integra wrappers, bootstrap/distribución y regresiones. Trabajadores
separados: runtime cache, Nodebootstrap y guías; revisiones cruzadas seguridad y
funcional/logging. UI/UX de producto no aplican. No sudo/apt, runtimes de aplicación,
deploy, descifrado, perfiles de proveedores ni modificación de proyectos externos.
