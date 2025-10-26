# Simple Dockerfile for Railway
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set CI environment
ENV CI=true
ENV NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build applications
RUN cd apps/api && pnpm build
RUN cd apps/web && pnpm build

# Create data directories
RUN mkdir -p /app/apps/api/data
RUN mkdir -p /app/apps/api/public/uploads

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main.js"]