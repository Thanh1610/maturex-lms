FROM node:24.15.0-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24.15.0-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:24.15.0-bookworm-slim AS runtime
ENV NODE_ENV=production APP_HOST=0.0.0.0 API_PORT=3001 SERVE_STATIC=1 LMS_DATABASE=/data/lms.sqlite LMS_UPLOADS=/data/uploads
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY server ./server
COPY tools/backup.mjs tools/restore.mjs tools/backup-lib.mjs ./tools/
COPY --from=build /app/dist ./dist
RUN mkdir -p /data/uploads && chown -R node:node /data
USER node
VOLUME /data
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]
