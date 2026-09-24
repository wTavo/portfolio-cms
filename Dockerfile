# ==============================================================================
# Dockerfile — Entorno Local y Contenerización de Portfolio Builder (Astro + Cloudflare)
# ==============================================================================

# Etapa 1: Imagen Base (Debian Slim con soporte nativo de glibc y certificados CA para TLS/HTTPS)
FROM node:22-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=development

# Etapa 2: Instalación de Dependencias
FROM base AS dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Etapa 3: Entorno de Desarrollo (Hot-Reload)
FROM base AS development
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321
CMD ["sh", "-c", "rm -f .astro/dev.json .astro/dev.pid 2>/dev/null || true; npx astro dev --host 0.0.0.0 --force"]

# Etapa 4: Compilación para Producción / Preview
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Etapa 5: Ejecución / Preview
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
EXPOSE 4321
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
