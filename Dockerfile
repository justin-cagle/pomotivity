# Build stage
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine as production-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/server.js ./
COPY --from=build-stage /app/src/data ./src/data
COPY --from=build-stage /app/src/version.js ./src/version.js

# Create data directory for persistence
RUN mkdir -p /app/data

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/health.json | grep -q "up" || exit 1

EXPOSE 80
ENV PORT=80

CMD ["node", "server.js"]
