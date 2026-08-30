# Tooling

El tooling construirá una distribución determinista desde una release del framework,
la verificará y sincronizará los repositorios registrados en `projects.yml`.

Interfaces previstas:

- `build`: producir el árbol vendorizable y su manifest de integridad.
- `verify`: comprobar el framework fuente o una instalación consumidora.
- `sync`: aplicar una distribución en un checkout consumidor.
- `publish`: coordinar branches y Pull Requests mediante GitHub App.

No se agregan scripts vacíos durante Foundation. Cada comando se incorporará con su
contrato, pruebas e idempotencia en la fase correspondiente.
