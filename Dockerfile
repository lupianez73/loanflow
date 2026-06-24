# ═══════════════════════════════════════════════════════════════════════
# DOCKERFILE — Multi-stage production build
# ═══════════════════════════════════════════════════════════════════════
# Multi-stage: Stage 1 builds the app, Stage 2 runs it (smaller image).
# Demonstrates: containerization (Docker) — a core full-stack skill

# ── Stage 1: Build ────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first — Docker layer caching
# If package.json unchanged, npm install layer is reused on next build
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

RUN npx prisma generate

COPY . .
RUN npm run build

# ── Stage 2: Production runtime ───────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Only the build output — no devDependencies
COPY --from=builder /app/.output ./output

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Nitro outputs a standalone Node.js server
CMD ["node", "output/server/index.mjs"]
