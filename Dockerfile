# Multi-stage build for monorepo
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# Build Web
WORKDIR /app/apps/web
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built API
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/eng.traineddata ./apps/api/
COPY --from=base /app/apps/api/ukr.traineddata ./apps/api/

# Copy built web app
COPY --from=base /app/apps/web/dist ./apps/web/dist

# Create data directory for SQLite
RUN mkdir -p /app/data

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main.js"]
