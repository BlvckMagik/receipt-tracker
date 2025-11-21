# Build stage — Node 20 + pnpm
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app

# copy lockfile and package.json
COPY pnpm-lock.yaml ./
COPY package.json ./

# install deps with retries + offline cache + max concurrency
RUN pnpm install --frozen-lockfile --prefer-offline --reporter=silent --retry=5 --fetch-timeout=200000 --network-concurrency=1

COPY . .

RUN pnpm build


# -------------------------------
# Production image
# -------------------------------

FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app

# copy pnpm offline cache
COPY --from=builder /root/.pnpm-store /root/.pnpm-store

# copy only necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json .

EXPOSE 3001

CMD ["node", "dist/main.js"]