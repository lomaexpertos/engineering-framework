# Heurísticas de exploración y puntos ciegos

## Contenido

1. Lentes universales
2. Preguntas de presión
3. Señales por dominio
4. Uso correcto de las heurísticas

## 1. Lentes universales

Usar solo las lentes relacionadas con el proceso y el riesgo presentes.

### Propósito y propiedad

- ¿Qué resultado de negocio debe producirse y quién responde por él?
- ¿Quién gana valor, quién asume costo y quién asume riesgo?
- ¿Cómo se sabe que el proceso terminó correctamente?

### Tiempo y estados

- ¿Qué evento inicia el proceso y cuál es la fecha efectiva?
- ¿Qué estados intermedios existen y qué transiciones son irreversibles?
- ¿Qué ocurre con periodos cerrados, eventos tardíos, zonas horarias o reaperturas?

### Dinero, cantidad y valoración

- ¿Qué se espera, qué se observa y cómo se explica la diferencia?
- ¿Qué moneda, unidad, precisión, redondeo, costo o tipo de cambio aplica?
- ¿Cuándo se reconoce el movimiento operativo, financiero, contable o fiscal?

### Responsabilidad y control

- ¿Quién crea, autoriza, ejecuta, custodia, corrige y audita?
- ¿Qué funciones no debería concentrar una sola persona?
- ¿Qué evidencia evita que una aprobación sea solo un campo editable?

### Excepción y recuperación

- ¿Cómo se corrige sin borrar historia?
- ¿Cancelar, revertir, sustituir y reabrir significan cosas distintas?
- ¿Qué ocurre con duplicados, solicitudes fuera de orden, reintentos o resultados ambiguos?

### Conciliación

- ¿Qué dos o más fuentes independientes deben coincidir?
- ¿Qué tolerancias existen y quién investiga diferencias?
- ¿Se corrige el dato, se registra un ajuste o se repara la causa?

### Evidencia y auditoría

- ¿Qué debe probarse, ante quién y por cuánto tiempo?
- ¿Qué identidad, hora, motivo, valor anterior y valor nuevo deben conservarse?
- ¿Qué datos son sensibles y quién puede consultarlos?

### Integraciones y degradación

- ¿Quién es la fuente de verdad?
- ¿Qué garantías ofrece el tercero y cómo se detecta un resultado incompleto?
- ¿Puede operarse sin conexión o con el proveedor caído? ¿Cómo se reconcilia después?

### Escala y variación

- ¿Qué cambia con volumen, sucursales, canales, turnos, monedas o jurisdicciones?
- ¿Las diferencias son configuraciones legítimas o inconsistencias históricas?
- ¿Qué tarea manual deja de ser segura al crecer?

### Ciclo de vida y datos heredados

- ¿Cómo inicia, cambia y termina una relación, cuenta, producto o instalación?
- ¿Cómo se migran saldos, históricos y casos en curso?
- ¿Qué información antigua no cumple las reglas actuales pero debe conservarse?

### Fraude y abuso

- ¿Cómo podría una persona beneficiarse manipulando tiempo, identidad, cantidades, autorizaciones o reintentos?
- ¿Qué colusión sería posible?
- ¿Qué patrón anómalo debería detectarse sin impedir la operación legítima?

### Consecuencias posteriores

- ¿Qué reportes, asientos, obligaciones, inventarios, pagos o decisiones consumen el resultado?
- ¿Qué ocurre si el proceso se modifica después de que otros ya usaron sus datos?
- ¿Qué comunicación o compensación requiere una corrección?

## 2. Preguntas de presión

Aplicar estas preguntas para probar un modelo aparentemente completo:

- ¿Qué pasa si el mismo evento llega dos veces?
- ¿Qué pasa si llega tarde o en orden inverso?
- ¿Qué pasa si una parte tiene éxito y otra no?
- ¿Qué pasa si nadie sabe con certeza si el tercero procesó la solicitud?
- ¿Qué pasa si se descubre el error después del cierre o de emitir un documento?
- ¿Qué pasa si el actor que registra también autoriza y recibe el beneficio?
- ¿Qué pasa si el usuario trabaja sin conexión o usa un procedimiento manual?
- ¿Qué pasa si dos fuentes confiables no coinciden?
- ¿Qué pasa si cambia una regla externa con casos todavía abiertos?
- ¿Qué pasa si el cliente pide eliminar el dato que sirve como evidencia?

## 3. Señales por dominio

Estas listas son disparadores de investigación, no alcances predeterminados.

### Corte de caja

Explorar apertura y fondo; caja, turno, sucursal y cajero; ventas, devoluciones, cancelaciones, entradas, salidas y retiros; medios de pago; esperado frente a contado; propinas, vales, crédito y moneda; diferencias y autorizaciones; conciliación con terminal, banco y sistema; cierres parciales o definitivos; reapertura, entrega de valores, contabilización, operación fuera de línea, evidencia y fraude.

Punto de criterio: un corte no es solo un conteo; es una rendición de responsabilidad sobre movimientos y custodias dentro de un periodo y alcance definidos.

### Suscripciones y cobranza recurrente

Explorar oferta, contrato y consentimiento; alta, prueba, activación, renovación, cambio de plan y baja; periodos, prorrateo, uso y fecha de corte; factura frente a cobro; autorización y tokenización del medio de pago; reintentos, dunning y gracia; fallas duras o temporales; impuestos, moneda, tipo de cambio y redondeo; créditos, devoluciones, contracargos y deuda; suspensión y reactivación; reconocimiento de ingresos; conciliación con procesador y banco; comunicación, privacidad e idempotencia.

Punto de criterio: prestar el servicio, generar el cargo, emitir la factura y recibir el dinero son eventos relacionados pero distintos.

### Inventarios

Explorar artículo, unidad y conversiones; ubicación, lote, serie, caducidad y condición; existencia física, disponible, reservada, en tránsito y contable; entradas, salidas, transferencias, ajustes y conteos; propiedad y consignación; costo y valoración; mermas, devoluciones y cuarentena; negativos; fechas efectivas; cierres; trazabilidad; reposición; integración con compras, ventas, manufactura y contabilidad; operación desconectada y fraude.

Punto de criterio: una sola cifra de “stock” rara vez responde todas las preguntas operativas y financieras.

### Manufactura

Explorar producto y versión; lista de materiales; rutas, operaciones y centros de trabajo; capacidad, calendarios y restricciones; orden, liberación, consumo, producción y cierre; sustitutos y rendimientos; scrap, retrabajo, coproductos y subproductos; calidad, lotes y trazabilidad; WIP; costo estándar o real y variaciones; subcontratación; mantenimiento; cambios de ingeniería; planeación; integración con inventario, compras, ventas y contabilidad.

Punto de criterio: planear, autorizar, ejecutar, registrar y costear la producción son problemas conectados, pero no equivalentes.

### Facturación, nómina o cumplimiento

Explorar por separado el hecho económico, el cálculo, el documento, la transmisión, la aceptación, el pago, la cancelación, la sustitución, la conservación y la conciliación. Confirmar jurisdicción, versión y fecha efectiva en fuentes oficiales. Identificar qué debe resolver un especialista acreditado.

## 4. Uso correcto de las heurísticas

1. Seleccionar las lentes que podrían cambiar el núcleo o el riesgo.
2. Formular una hipótesis concreta, no una lista genérica.
3. Pedir evidencia o un ejemplo real.
4. Registrar la respuesta como hecho, variante o pendiente.
5. Detener la exploración cuando el tema no afecte la etapa ni una decisión difícil de revertir.

No usar la presencia de una palabra en estas listas como prueba de que el proyecto necesita una función. La decisión de alcance requiere contexto y consecuencias explícitas.
