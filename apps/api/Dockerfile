# Build stage — Node 20 + pnpm
FROM node:20-alpine AS builder

# install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app

# copy only manifest files to install deps
COPY pnpm-lock.yaml ./
COPY package.json ./

# install deps (prod+dev) with pnpm
RUN pnpm install --frozen-lockfile

# copy source code
COPY . .

# build NestJS
RUN pnpm build


# -------------------------------
# Production image
# -------------------------------

FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app

# copy only necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json .

EXPOSE 3001

CMD ["node", "dist/main.js"]