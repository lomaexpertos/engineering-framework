# Deployment traffic management

## Applicability

Esta Policy aplica solo cuando un ambiente administra proxy, DNS, TLS, upstreams,
slots o conmutación explícita de tráfico.

## Requirements

1. La tecnología responsable **MUST** identificarse explícitamente.
2. Configuración de edge **MUST** validarse antes de recargar el controlador.
3. Un cutover **MUST** verificar primero la salud del destino.
4. El cambio de tráfico **MUST** ser observable y tener un resultado inequívoco.
5. Conexiones del destino anterior **MUST** drenarse o terminarse de manera controlada
   según el protocolo del servicio.
6. La configuración anterior **MUST** permanecer recuperable hasta validar el nuevo
   destino.
7. Un fallo de validación **MUST NOT** promover el destino nuevo ni retirar el anterior.
8. Upstreams o archivos de traffic **MUST NOT** existir cuando el ambiente no realiza
   conmutación.
