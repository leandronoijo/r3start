FROM node:22.14.0-bookworm-slim AS development
WORKDIR /workspace
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci
COPY . .

FROM development AS build
RUN npm run build

FROM node:22.14.0-bookworm-slim AS node-runtime
FROM registry.supertokens.io/supertokens/supertokens-postgresql:10.1.1 AS production
USER root
WORKDIR /app
ENV NODE_ENV=production
COPY --from=node-runtime /usr/local /usr/local
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --omit=dev
COPY --from=build /workspace/apps/api/dist apps/api/dist
COPY --from=build /workspace/apps/web/dist apps/web/dist
COPY --from=build /workspace/packages/shared/dist packages/shared/dist
COPY --from=build /workspace/apps/api/drizzle apps/api/drizzle
COPY docker/start-production.sh /usr/local/bin/start-production
RUN chmod 0755 /usr/local/bin/start-production
USER supertokens
EXPOSE 3000
CMD ["/usr/local/bin/start-production"]
