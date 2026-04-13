# ─────────────────────────────────────────────
#  EcoBikes — Dockerfile
#  El build de Expo se hace en GitHub Actions
#  Este Dockerfile solo sirve los archivos con Nginx
# ─────────────────────────────────────────────
FROM nginx:stable-alpine

# Copiar build generado por Expo (carpeta dist)
COPY dist/ /usr/share/nginx/html

# Configuración de Nginx para SPA (React/Expo web)
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
