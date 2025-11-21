# ------------------------
# Build stage
# ------------------------
    FROM node:20-alpine AS builder

    RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
    
    WORKDIR /app
    
    COPY pnpm-lock.yaml ./
    COPY package.json ./
    
    RUN pnpm install --frozen-lockfile
    
    COPY . .
    
    RUN pnpm build
    
    
    # ------------------------
    # NGINX stage
    # ------------------------
    FROM nginx:alpine
    
    # копіюємо зібраний фронт
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # використовуємо кастомний nginx.conf (за бажанням)
    # COPY nginx.conf /etc/nginx/nginx.conf
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]