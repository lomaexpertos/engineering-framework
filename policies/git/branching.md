# Branching

## Requirements

1. Una rama protegida por el proyecto **MUST NOT** recibir commits directos ni
   force-push mediante un flujo ordinario.
2. La rama por defecto **SHOULD** tratarse como protegida salvo que el repositorio
   documente explícitamente otro contrato.
3. Una rama de trabajo **SHOULD** seguir la convención existente. Si no existe, debe
   usar un nombre breve en lowercase kebab-case que describa el cambio.
4. Crear una rama **MUST NOT** interpretarse como autorización para publicarla,
   sobrescribir una remota o abrir un Pull Request.
5. Reescribir historia publicada **MUST** tener autorización explícita y considerar a
   sus consumidores.
