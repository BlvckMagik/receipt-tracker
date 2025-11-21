# Base lightweight image for ARM (Raspberry Pi)
FROM node:18-alpine3.19 AS builder

# Set working directory
WORKDIR /app

# Install dependencies separately to leverage Docker cache
COPY package*.json ./
RUN npm install --omit=dev --no-audit --prefer-offline

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm run build


# -------------------------------
# Production Image
# -------------------------------

FROM node:18-alpine3.19

WORKDIR /app

# Copy only the built output + production deps
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]