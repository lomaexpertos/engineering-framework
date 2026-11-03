# Conocimiento del dominio

Plantilla: documentar únicamente comportamiento comprobado y razones conocidas.
Reemplazar estas indicaciones por hechos del sistema; conservar solo secciones con
contenido útil y hacer visibles los desconocidos materiales. Un dominio pequeño
puede conservar todo aquí. Separar datos, flujos o dependencias únicamente cuando
tengan consulta independiente y enlazarlos desde esta visión general.
Indicar alcance, fecha de comprobación y tipo/autoridad de fuentes del inventario,
sin listas minuciosas de archivos revisados ni bitácoras de investigación.

## Propósito, alcance y lenguaje

Explicar qué responsabilidad cumple el dominio, para quién y dónde termina. Definir
los términos que tengan significado propio y los límites con módulos vecinos.

## Capacidades, actores y permisos

Describir las operaciones de consulta y cambio, qué actores pueden realizarlas,
condiciones relevantes y resultado. Distinguir visibilidad en la interfaz de
autorización efectiva en el backend.

## Reglas e invariantes

Describir qué debe preservarse, por qué y bajo qué condiciones aplica. Distinguir
regla de negocio de una decisión técnica incidental. Conservar solo razones
confirmadas; si el motivo se desconoce, explicar la mecánica sin inventarlo.

## Estados, flujos y contratos

Explicar recorridos principales desde pantalla/API/job/evento hasta servicios,
persistencia y efectos, con estados, transiciones, contratos y errores relevantes.
Relacionar las capas en una explicación comprensible sin recuperar un expediente
ni depender de una lista de archivos. Un diagrama o mapa de implementación puede
complementarla si aporta valor.

## Datos y persistencia

Identificar bases o conexiones lógicas, esquemas y objetos con nombres confirmados.
Explicar qué representa cada tabla relevante, relaciones, claves y restricciones
que sostienen las reglas; separar vistas y otros objetos de las tablas base.
Indicar propiedad —propia, compartida, externa o desconocida— y acceso —lectura,
escritura o ambos—, sin confundir esas dimensiones.

Cuando haya tablas en alcance, informar el total identificado por base/conexión y
esquema, con vistas separadas; si es parcial, señalar cantidad y límites. Declarar
identidad única y criterio; no contar
dos veces aliases, modelos ni tablas que se leen y escriben. Distinguir inventario
estático del observado en una base real e indicar los límites de resolución.

## Dependencias, configuración y radio de impacto

Explicar relaciones entrantes y salientes con módulos, servicios, jobs, eventos e
integraciones, los datos intercambiados y sus efectos. Documentar opciones que
cambian comportamiento por nombre público, propósito, alcance y default comprobado;
distinguirlo de valores efectivos no verificados. Excluir secretos y datos privados.
Indicar qué capacidades, consumidores y datos pueden afectarse al cambiar contratos,
configuración o tablas, su propagación y límites; separar lo observado de lo inferido.

## Diagnóstico y límites

Explicar fallos y trazabilidad real cuando importen, sin valores sensibles. Si hay
brechas conocidas, identificarlas sin inventar garantías. Distinguir conclusiones
estáticas, cobertura validada y comportamiento observado, sin incluir comandos ni
historial de pruebas aplicadas. Desconocido no significa no aplicable.

Mantener una explicación del estado vigente con detalle suficiente para consultas
habituales. Actualizar las secciones afectadas al cerrar investigaciones o cambios
materiales; no acumular logs de sesiones, specs, ramas ni archivos revisados.
