# Deployment strategy selection

Cargar esta referencia únicamente cuando una estrategia esté ausente, cambie o deba
validarse contra la topología real.

La Policy de estrategias cargada por la Skill es la autoridad sobre opciones
permitidas y evidencia mínima. Esta referencia describe únicamente cómo tomar y
registrar la decisión.

## Workflow

1. Identificar tipo de servicio, estado local, réplicas, tráfico, dependencias y
   tolerancia documentada a interrupción.
2. Descartar estrategias que no cumplan la aplicabilidad y evidencia exigidas por la
   Policy.
3. Cuando más de una opción siga siendo válida, presentar su impacto operativo y
   obtener la decisión responsable sin inferir zero downtime.
4. Derivar únicamente los artefactos requeridos por la estrategia elegida.
5. Registrar la decisión por servicio en `deployment.yaml` y comprobar su consistencia
   con scripts, salud, tráfico y recuperación.
