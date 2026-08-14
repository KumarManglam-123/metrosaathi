# ==============================================================================
# Stage 1: Dependency Installation ("deps")
# ==============================================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package manifests for efficient layer caching
COPY package.json package-lock.json ./
RUN npm ci

# ==============================================================================
# Stage 2: Application Build ("builder")
# ==============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry collection during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile TypeScript and generate standalone bundle
RUN npm run build

# ==============================================================================
# Stage 3: Production Runtime ("runner")
# ==============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create unprivileged system group and user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server output
COPY --from=builder /app/public ./public

# Set correct permissions for Next.js cache directory
RUN mkdir .next && chown nextjs:nodejs .next

# Automatically leverage standalone output traces (reduces image size significantly)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
