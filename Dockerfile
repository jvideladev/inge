# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Etapa 1: dependencias
# ─────────────────────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app

# Dependencias necesarias para algunos paquetes nativos en Alpine
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

# ─────────────────────────────────────────────────────────────
# Etapa 2: build de Next.js
# ─────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ─────────────────────────────────────────────────────────────
# Etapa 3: runtime mínimo
# ─────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=6001
ENV HOSTNAME=0.0.0.0

# Usuario no-root
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Archivos generados por output: 'standalone'
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 6001

CMD ["node", "server.js"]
