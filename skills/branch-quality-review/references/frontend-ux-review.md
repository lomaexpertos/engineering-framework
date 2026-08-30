# Frontend And UX Review

## Componentizacion

Reporta cuando:

- una card, modal, popup, sidebar, tree view, stepper, tabla o formulario complejo esta inline sin componente reusable
- se ignoran componentes existentes del proyecto
- se crean componentes nuevos sin seguir props, slots, estados o convenciones locales
- se duplica logica visual o de formulario que ya existe

No marques componentes pequenos inline como problema si son triviales y no se reutilizan.

## Design system

Revisa:

- paleta, tokens, spacing, tipografia, estados y variantes
- colores semanticos no autorizados
- estilos locales que rompen consistencia
- botones, inputs, selects, errores, empty states, loading y disabled states

El problema no es "se ve distinto" sino riesgo de inconsistencia, deuda y mala experiencia.

## Flujos multi-step

En procesos con pasos, ventanas secuenciales o wizards, verifica que cada campo este en la etapa correcta:

- campos que condicionan pasos posteriores deben ir antes
- campos que dependen de una seleccion previa deben ir despues
- catalogos usados en varios pasos deben colocarse donde reduzcan repeticion y ambiguedad
- confirmacion, totales e impactos deben ir al cierre
- datos derivables no deben pedirse al usuario

Si el dominio no permite inferirlo, agrega una pregunta concreta en el reporte en vez de inventar una regla.

## Breadcrumbs y navegacion

Reporta:

- breadcrumbs ausentes en vistas que el proyecto normalmente los usa
- modulo, entidad o accion incorrectos
- regreso a rutas que pierden contexto
- pasos sin indicador de avance cuando el proceso es secuencial

## Validacion visible

Revisa que los formularios:

- muestren errores por campo
- respeten required/disabled/loading
- validen selects y catalogos
- no permitan longitudes absurdas para telefono, RFC, CLABE, codigos o montos
- mantengan validacion backend equivalente para datos persistentes

## Estado remoto y concurrencia

Revisa:

- doble submit y acciones repetidas mientras una solicitud sigue pendiente
- respuestas fuera de orden que sobrescriben estado mas reciente
- solicitudes sin cancelacion o descarte al navegar, cambiar filtros o desmontar
- estado optimista sin rollback ni reconciliacion
- datos derivados duplicados en varios stores o componentes
- botones habilitados durante cobros, aprobaciones o transiciones irreversibles
- reintentos de UI que puedan repetir un efecto no idempotente

La deshabilitacion del boton mejora UX, pero no reemplaza idempotencia ni concurrencia en backend.

## Seguridad y privacidad

Revisa:

- acciones o campos privilegiados confiados solamente a ocultamiento visual
- HTML crudo, URLs, redirects o nombres de archivo construidos con datos no confiables
- tokens, secretos o datos personales en almacenamiento, URL, analytics o logs del navegador
- respuestas que exponen propiedades que la vista no necesita
- errores que revelan existencia de recursos o detalles internos

## Accesibilidad y recuperacion

Verifica HTML semantico, etiquetas, teclado, foco visible, gestion de foco en overlays, anuncios de errores y estados que no dependan solo de color. En acciones criticas, mostrar resultado, contexto, posibilidad de reintento seguro y estado pendiente cuando el backend no tenga una respuesta definitiva.
