FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY package-lock.json ./
RUN npm i -g @nestjs/cli
RUN npm ci
COPY . .

# Build notifications app
FROM base AS notifications-builder
RUN npm run build:notifications

# Build products app
FROM base AS products-builder
RUN npm run build:products

# Notifications application
FROM node:22-alpine AS notifications
WORKDIR /app
COPY --from=notifications-builder /app/dist/apps/notifications ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./
EXPOSE 3000
CMD ["node", "dist/main"]

# Products application
FROM node:22-alpine AS products
WORKDIR /app
COPY --from=products-builder /app/dist/apps/products ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./
EXPOSE 3001
CMD ["node", "dist/main"]
