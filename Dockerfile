# Multi-stage Dockerfile for dstack JS SDK Demo
# Stage 1: Dependencies
FROM node:20-slim AS deps
# Install xz-utils and other necessary packages using apt
RUN apt-get update && apt-get install -y \
    xz-utils \
    openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npm install prisma @prisma/client

# Stage 2: Builder
FROM node:20-slim AS builder
# Install xz-utils and other build dependencies using apt
RUN apt-get update && apt-get install -y \
    xz-utils \
    openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure prisma directory with migrations is included
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM node:20-slim AS runner
WORKDIR /app

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nextjs

# Install dumb-init and xz-utils for runtime using apt
RUN apt-get update && apt-get install -y \
    dumb-init \
    xz-utils \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy necessary files from builder - order matters!
# First copy the standalone output which includes the server files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Then copy static files which are not included in standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Copy Prisma files with correct ownership (including migrations)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
# Copy ALL node_modules for prisma CLI (required for migrations)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
# Copy startup script
COPY --chown=nextjs:nodejs scripts/startup.sh ./startup.sh
RUN chmod +x ./startup.sh

# Create necessary directories and set permissions
RUN mkdir -p /app/.next/cache/images /app/.next/cache/fetch /app/prisma && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app/.next

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV APP_NAMESPACE "the-accountant-v1"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Don't switch to non-root user yet - startup script needs root for permissions
# USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application with migration script
CMD ["./startup.sh"]