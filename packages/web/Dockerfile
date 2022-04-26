# syntax = docker/dockerfile:1.2
# Install dependencies only when needed
FROM node:16-bullseye-slim AS base

# ENV NODE_ENV production
ENV TZ Asia/Tokyo
ENV BASE_URL https://shin-umamusume.takuji31.dev
ENV NEXTAUTH_URL https://shin-umamusume.takuji31.dev

RUN apt-get update && apt-get install -y openssl chromium

FROM base AS pnpmbase

RUN npm install -g pnpm@7.0.0-rc.8

# Install dependencies only when needed
FROM pnpmbase AS deps

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./packages/web/package.json ./packages/web/
# COPY ./packages/functions/package.json ./packages/functions/
RUN pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM pnpmbase AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/web/node_modules ./packages/web/node_modules
# COPY --from=deps /app/packages/functions/node_modules ./packages/functions/node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN --mount=type=secret,id=_env,dst=/app/.env pnpm build:web

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/packages/web/next.config.js ./
COPY --from=builder /app/packages/web/public ./public
COPY --from=builder /app/packages/web/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
