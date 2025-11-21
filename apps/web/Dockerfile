FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app

# Копіюємо весь workspace
COPY ../../pnpm-lock.yaml ../../package.json ./
COPY ../../pnpm-workspace.yaml ./
COPY ../../apps ./apps
COPY ../../packages ./packages

# Встановлюємо тільки для web
RUN pnpm install --filter "./apps/web..." --frozen-lockfile

# Білд саме web
WORKDIR /app/apps/web
RUN pnpm build

# Nginx
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
COPY nginx.conf /etc/nginx/conf.d/default.conf