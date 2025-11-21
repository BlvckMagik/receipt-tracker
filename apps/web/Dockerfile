# Build stage
FROM node:18-alpine as builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --fetch-timeout=600000

COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80