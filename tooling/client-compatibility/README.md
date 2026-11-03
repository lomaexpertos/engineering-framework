# Discovery con clientes reales y transporte local

Este smoke ejecuta las distribuciones CLI reales fijadas en el Dockerfile: Codex
0.165.0 y Claude Code 2.1.312. Un consumidor desechable recibe el harness mediante
su sincronizador; los clientes leen sus instrucciones y adaptadores reales.

El proceso Node escucha solo en loopback dentro del contenedor y responde al protocolo
de los proveedores de forma determinista. La prueba inspecciona las peticiones que
los clientes realmente construyen: instrucciones de AGENTS, metadata de una skill
local adaptada y ausencia de su cuerpo antes de invocarla.

## Reproducir

Desde la raíz del productor:

```bash
docker build -f tooling/client-compatibility/Dockerfile -t engineering-harness-client-compatibility:20261028 .
docker run --rm --network none engineering-harness-client-compatibility:20261028
```

La obtención de clientes requiere red durante el build. La ejecución usa únicamente
loopback, sin red externa, mounts de credenciales ni claves reales. Las versiones
son explícitas; no se instalan dependencias en el host. El resultado JSON identifica
versiones y assertions observadas. Un fallo impide afirmar compatibilidad aprobada.

## Límites

Comprueba discovery con CLI real y transporte simulado. No usa un modelo real ni
certifica selección semántica de skills, ejecución de subagentes, login, facturación,
interfaces gráficas o clientes distintos de estas versiones. No equivale a validar
el comportamiento de todas las herramientas de cada cliente.

## Referencias oficiales

- [Codex: AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
- [Codex: discovery de skills](https://learn.chatgpt.com/docs/build-skills).
- [Codex: proveedores y base_url](https://learn.chatgpt.com/docs/config-file/config-reference).
- [Claude: instrucciones e importación AGENTS](https://code.claude.com/docs/en/memory).
- [Claude: gateway de modelo](https://code.claude.com/docs/en/llm-gateway).
- [Claude: ejecución programática](https://code.claude.com/docs/en/headless).

## Ejecución uniforme y recorridos mixtos

Las pruebas opcionales adicionales usan clientes reales con transporte local determinista,
HOME/XDG temporales y credenciales ficticias. No evalúan calidad de modelos.

```bash
HARNESS_AGENT_CLIENTS=codex,opencode node tooling/test-agent-clients.mjs
HARNESS_MIXED_PRIMARIES=codex node tooling/test-agent-mixed-workflows.mjs
docker build --target mixed-workflows -f tooling/client-compatibility/Dockerfile -t engineering-harness-mixed-clients:20261028 .
docker run --rm --network none engineering-harness-mixed-clients:20261028
```

El último recorrido usa Claude Code para definición y revisión y OpenCode como worker.
Ambos recorridos mixtos completan definición, implementación, cinco revisores y
verificación mediante el ejecutor del harness. Las respuestas de backend son fixtures;
las pruebas de comportamiento del producto y la aceptación del coordinador siguen
siendo necesarias en cada iniciativa real. Las imágenes son ambientes opcionales de
compatibilidad; setup, doctor y ejecución habitual del harness no requieren Docker.
