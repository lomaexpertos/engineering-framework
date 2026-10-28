FROM node:22.19.0-alpine3.22@sha256:d2166de198f26e17e5a442f537754dd616ab069c47cc57b889310a717e0abbf9 AS discovery
RUN apk add --no-cache bash=5.2.37-r0 git=2.49.1-r0
RUN npm install --global --no-audit --no-fund @openai/codex@0.165.0 @anthropic-ai/claude-code@2.1.312
WORKDIR /harness
COPY --chown=node:node policies ./policies
COPY --chown=node:node skills ./skills
COPY --chown=node:node checks ./checks
COPY --chown=node:node schemas ./schemas
COPY --chown=node:node templates ./templates
COPY --chown=node:node tooling ./tooling
COPY --chown=node:node VERSION ./VERSION
USER node
CMD ["node", "tooling/client-compatibility/smoke.mjs"]

# Optional mixed-client acceptance environment; the harness itself remains native.
FROM node:22.14.0-bookworm-slim@sha256:1c18d9ab3af4585870b92e4dbc5cac5a0dc77dd13df1a5905cea89fc720eb05b AS mixed-workflows
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install --global --no-audit --no-fund @anthropic-ai/claude-code@2.1.312 @opencode/cli@2.2.0
COPY --from=discovery --chown=node:node /harness /harness
WORKDIR /harness
USER node
ENV HARNESS_MIXED_PRIMARIES=claude
CMD ["node", "tooling/test-agent-mixed-workflows.mjs"]

FROM discovery AS default
