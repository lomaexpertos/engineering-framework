# Software supply chain

## Requirements

1. Dependencias y acciones de CI **MUST** fijarse mediante versiones o referencias inmutables conforme al ecosistema.
2. Lockfiles y manifests **MUST** permanecer sincronizados y revisables.
3. Paquetes, imágenes y artefactos **SHOULD** obtenerse de fuentes aprobadas con procedencia verificable cuando exista.
4. Scripts de instalación y hooks con ejecución de código **MUST** revisarse proporcionalmente al privilegio y entorno donde operarán.
5. Vulnerabilidades relevantes **MUST** evaluarse por alcanzabilidad e impacto; **MUST NOT** ocultarse mediante exclusiones sin owner y justificación.
6. Credenciales de publicación, registro o CI **MUST** seguir least privilege y permanecer separadas de secretos de aplicación.
