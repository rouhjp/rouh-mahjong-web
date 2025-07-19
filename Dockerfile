# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production
ENV CORS_ORIGIN=https://rouhjp.github.io

# Copy root package files
COPY package*.json ./
COPY packages/mahjong-web-server/package*.json ./packages/mahjong-web-server/
COPY packages/mahjong-core/package*.json ./packages/mahjong-core/
COPY packages/mahjong-web-types/package*.json ./packages/mahjong-web-types/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/mahjong-core/ ./packages/mahjong-core/
COPY packages/mahjong-web-types/ ./packages/mahjong-web-types/
COPY packages/mahjong-web-server/ ./packages/mahjong-web-server/

# Build all packages
RUN npm run build -w @mahjong/core
RUN npm run build -w @mahjong/web-types
RUN npm run build -w @mahjong/web-server

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files for production dependencies
COPY package*.json ./
COPY packages/mahjong-web-server/package*.json ./packages/mahjong-web-server/

# Install only production dependencies
RUN npm ci --only=production

# Copy built application and dependencies
COPY --from=builder /app/packages/mahjong-core/dist ./packages/mahjong-core/dist
COPY --from=builder /app/packages/mahjong-core/package.json ./packages/mahjong-core/
COPY --from=builder /app/packages/mahjong-web-types/dist ./packages/mahjong-web-types/dist
COPY --from=builder /app/packages/mahjong-web-types/package.json ./packages/mahjong-web-types/
COPY --from=builder /app/packages/mahjong-web-server/dist ./packages/mahjong-web-server/dist
COPY --from=builder /app/packages/mahjong-web-server/package.json ./packages/mahjong-web-server/

# Set working directory to server package
WORKDIR /app/packages/mahjong-web-server

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]