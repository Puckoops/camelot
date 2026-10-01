FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/camelot/package.json ./packages/camelot/
COPY packages/camelot-mcp/package.json ./packages/camelot-mcp/
COPY apps/site/package.json ./apps/site/
RUN npm ci -w @puckoops/camelot -w @puckoops/camelot-mcp
COPY packages/camelot/README.md ./packages/camelot/
COPY packages/camelot/src ./packages/camelot/src
COPY apps/site/src/content ./apps/site/src/content
COPY packages/camelot-mcp ./packages/camelot-mcp
RUN npm run catalog -w @puckoops/camelot-mcp \
 && npm run build -w @puckoops/camelot-mcp

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/camelot/package.json ./packages/camelot/
COPY packages/camelot-mcp/package.json ./packages/camelot-mcp/
COPY apps/site/package.json ./apps/site/
RUN npm ci --omit=dev -w @puckoops/camelot-mcp \
 && rm -rf node_modules/@puckoops

FROM node:22-alpine
ENV NODE_ENV=production \
    PORT=8787
WORKDIR /srv
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=deps --chown=node:node /app/packages/camelot-mcp ./packages/camelot-mcp
COPY --from=build --chown=node:node /app/packages/camelot-mcp/dist ./packages/camelot-mcp/dist
COPY --from=build --chown=node:node /app/packages/camelot-mcp/data ./packages/camelot-mcp/data
WORKDIR /srv/packages/camelot-mcp
USER node
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" > /dev/null || exit 1
CMD ["node", "dist/server.js"]
