# Use Node.js 18 Alpine for smaller image size (AMD64 for Azure Container Apps compatibility)
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install all dependencies once (dev + prod) for build stage reuse
COPY package*.json ./
RUN \
  if [ -f package-lock.json ]; then npm ci --ignore-scripts --legacy-peer-deps --no-audit --no-fund; \
  else npm install --ignore-scripts --legacy-peer-deps --no-audit --no-fund; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
# Install OpenSSL for Prisma
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
# Reuse node_modules installed in deps stage to avoid re-install and reduce flakiness
COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Ensure Prisma Client is generated (we disabled npm scripts earlier)
COPY prisma ./prisma
ENV DATABASE_URL=postgresql://user:pass@localhost:5432/db?schema=public
RUN npm exec prisma generate

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/docs/getting-started#telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
ENV CI=true
RUN npm run build --legacy-peer-deps --if-present

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy package.json for runtime dependencies and healthcheck script
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/healthcheck.js ./healthcheck.js

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "server.js"] 