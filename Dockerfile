# Multi-stage build for monorepo
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy all package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
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

# Copy package files for production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install only production dependencies for API
WORKDIR /app/apps/api
RUN pnpm install --no-frozen-lockfile --prod

# Copy built API
COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/apps/api/eng.traineddata ./
COPY --from=base /app/apps/api/ukr.traineddata ./

# Copy built web app
COPY --from=base /app/apps/web/dist ./web/dist

# Create data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "dist/main.js"]
