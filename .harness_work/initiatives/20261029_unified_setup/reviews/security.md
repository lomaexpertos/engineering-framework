# Revisión de preparación y caché

El revisor setup_runtime examinó el Nodebootstrap de setup_bootstrap; no era su autor.
Reprodujo ejecución de un Node falso cuando el directorio administrado permitía
escritura ajena y el atacante podía reemplazar binario y receipt.
El autor añadió validación de UID/permisos de directorios y archivos antes de
consultar versión o ejecutar. La reproducción fue revalidada: rechazo y canary no ejecutado.

También se reforzó el runtime para todos sus ancestros, con excepción de directorios
sticky de root del sistema; el destino privado conserva owner del usuario y no022.
La preparación usa HOME/.engineering-harness/cache, no cambia ~/.cache ni herramientas
personales. Locks y publicación conservan contenido desconocido o ajeno.

La prueba real del coordinador preparó Node24.18.0, Gitleaks8.30.1 y SOPS3.13.3
oficiales sin depender del PATH ni instalaciones previas; hashes fijados y consumidor
instalado. Diagnóstico y reutilización offline pasaron con curl/tar bloqueados.
También hubo inspección independiente funcional/logging sobre metadata y duplicados,
con regresiones reales que conservan hallazgos sin imprimir sus tokens sintéticos.

Sin bloqueantes pendientes en el alcance. UI/UX de producto no aplican: solo CLI y
preparación de herramientas transversales. No hubo sudo, dependencias del producto,
descifrado, credenciales emitidas ni deployments. Linux x64 real comprobado; otras
plataformas mantienen soporte declarado y pines pero no fueron ejecutadas aquí.
