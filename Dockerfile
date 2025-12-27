FROM node:22-alpine AS builder
RUN npm i -g pnpm
WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source files
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Build the application
RUN pnpm build

# Production stage
FROM node:22-alpine
RUN npm i -g pnpm
WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy migrations for runtime migration execution
COPY --from=builder /app/src/migrations ./src/migrations
COPY --from=builder /app/src/common/database/type-orm/data-source.ts ./src/common/database/type-orm/data-source.ts

# Install typeorm CLI dependencies for migrations
RUN pnpm add typeorm ts-node typescript

EXPOSE 3000

# Run migrations and start the app
CMD ["sh", "-c", "pnpm migration:run && node dist/main"]