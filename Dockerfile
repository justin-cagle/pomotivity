# Build stage — compile native deps and build frontend
FROM node:20-alpine AS build-stage
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build && npm prune --production

# Production stage — no build tools needed
FROM node:20-alpine AS production-stage
WORKDIR /app
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/dist ./dist
COPY server.js ./
COPY src/version.js ./src/version.js

RUN mkdir -p /app/data

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/health.json | grep -q "up" || exit 1

EXPOSE 80
ENV PORT=80

CMD ["node", "server.js"]
