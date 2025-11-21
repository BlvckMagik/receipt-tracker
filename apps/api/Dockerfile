# ------------------------
# Build stage
# ------------------------
    FROM node:20-alpine AS builder

    RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
    
    WORKDIR /app
    
    COPY pnpm-lock.yaml ./
    COPY package.json ./
    
    # install deps with offline cache
    RUN pnpm fetch
    RUN pnpm install --offline --frozen-lockfile --prefer-offline
    
    COPY . .
    
    RUN pnpm build
    
    # ------------------------
    # Production stage
    # ------------------------
    FROM node:20-alpine
    
    RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
    
    WORKDIR /app
    COPY --from=builder /app/dist ./dist
    COPY package.json pnpm-lock.yaml ./
    
    RUN pnpm install --prod --frozen-lockfile --ignore-scripts
    
    CMD ["node", "dist/main.js"]