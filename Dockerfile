FROM node:22.19.0-alpine3.22@sha256:d2166de198f26e17e5a442f537754dd616ab069c47cc57b889310a717e0abbf9 AS validation

RUN apk add --no-cache bash=5.2.37-r0 git=2.49.1-r0

WORKDIR /workspace
COPY --chown=node:node . .

USER node

CMD ["sh", "-c", "node tooling/validate-framework.mjs && node tooling/test-distribution.mjs && node tooling/test-publication.mjs"]
