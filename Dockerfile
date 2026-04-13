# ─────────────────────────────────────────────
#  STAGE 1 — Build: genera la web estática
# ─────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Variables de entorno para build no-interactivo
ENV CI=1
ENV EXPO_NO_TELEMETRY=1
ENV NODE_ENV=production

# Copiar dependencias primero (cache layer)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copiar el resto del proyecto
COPY . .

# Exportar la app como web estática
RUN npx expo export --platform web --output-dir dist

# ─────────────────────────────────────────────
#  STAGE 2 — Serve: Nginx sirve el build
# ─────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Copiar build generado por Expo
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración básica de Nginx para SPA
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
