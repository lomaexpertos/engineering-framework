# Revisión de seguridad

## Contenido

1. Nivel de rigor
2. Identidad y autorización
3. Entradas, salidas y archivos
4. Datos, secretos y criptografía
5. Configuración y supply chain
6. Abuso, recursos y excepciones
7. Auditoría y evidencia

## 1. Nivel de rigor

Usar `baseline`, `standard` o `high-assurance` según activos y exposición. Inspirarse en estándares vigentes como OWASP ASVS para organizar controles, pero no declarar cumplimiento basándose sólo en el diff o revisión estática.

Aplicar siempre un baseline. Elevar a high assurance para dinero, identidad, privilegios, datos sensibles, operaciones irreversibles o servicios expuestos a Internet con alto impacto.

## 2. Identidad y autorización

Revisar:

- autenticación en toda entrada no pública;
- sesión, token, expiración, revocación y recuperación cuando cambien;
- autorización por función, objeto y propiedad;
- tenant, empresa, cuenta, sucursal y ownership en la consulta confiable;
- denegación por defecto y rutas alternativas;
- mass assignment de roles, estados, saldos u otros campos protegidos;
- segregación de funciones y acciones administrativas;
- identidades de servicio, API keys y privilegios mínimos.

Probar acceso permitido, denegado, horizontal, vertical y entre tenants. La UI no constituye autorización.

## 3. Entradas, salidas y archivos

Validar estructura, tipo, rango, tamaño, cardinalidad y semántica. Buscar:

- SQL, command, template, code o header injection;
- XSS, CSRF, open redirect y URLs controladas que permitan SSRF;
- path traversal, nombres inseguros y extracción de archivos;
- deserialización de datos no confiables;
- HTML o contenido activo sin sanitización contextual;
- uploads sin límites, tipo verificado, almacenamiento aislado o autorización de descarga;
- respuestas con campos internos o sensibles innecesarios.

## 4. Datos, secretos y criptografía

Comprobar:

- ausencia de credenciales, tokens, cookies y llaves en código, logs, URLs y artefactos;
- mecanismos seguros de configuración y rotación;
- minimización, retención, borrado y acceso a PII o datos regulados;
- cifrado y aleatoriedad mediante librerías confiables;
- transporte seguro y validación de certificados;
- errores que no permitan enumerar recursos ni filtren detalles internos.

No inventar obligaciones regulatorias. Marcar la necesidad de validación especializada cuando corresponda.

## 5. Configuración y supply chain

Revisar cambios en:

- CORS, cookies, headers, debug, puertos y defaults inseguros;
- manifests, lockfiles y dependencias transitivas;
- scripts de instalación, hooks y comandos ejecutados durante build;
- imágenes base, acciones CI y artefactos descargados;
- checksums, firmas, procedencia y permisos de publicación cuando el riesgo lo exija;
- endpoints, versiones antiguas, rutas de prueba y funciones ocultas expuestas.

No sustituir SCA, secret scanning o SAST; usar sus resultados como evidencia adicional.

## 6. Abuso, recursos y excepciones

Buscar:

- falta de rate limit, cuotas, paginación máxima o límites de batch/upload;
- automatización abusiva de flujos sensibles aunque cada request sea válido;
- costos externos ilimitados por SMS, correo, IA, almacenamiento o proveedores;
- loops, recursión, fan-out o consultas controlables por entrada;
- fail-open, éxito falso, fallback inseguro y excepciones silenciadas;
- estados internos revelados por mensajes, tiempos o códigos diferenciados;
- replay de tokens, enlaces, cupones o acciones de un solo uso.

## 7. Auditoría y evidencia

Para acciones críticas, confirmar actor, tenant, correlación, fecha confiable, resultado, motivo y cambios relevantes sin registrar secretos o payloads completos.

Exigir alertas o señales operativas para fallos de autenticación, autorización, firma, fraude, reintentos agotados o cambios privilegiados cuando el sistema de observabilidad esté dentro del alcance.

Registrar en el reporte qué controles se revisaron y con qué evidencia. Marcar `no-verificable` cuando dependan de infraestructura, secretos o configuración no disponible.
