FROM node:22.19.0-alpine3.22@sha256:d2166de198f26e17e5a442f537754dd616ab069c47cc57b889310a717e0abbf9
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
