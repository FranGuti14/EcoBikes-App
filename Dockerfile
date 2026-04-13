# ─────────────────────────────────────────────
#  EcoBikes — Dockerfile
#  Sirve una página de status con Nginx
#  El deploy real va a Firebase Hosting
# ─────────────────────────────────────────────
FROM nginx:stable-alpine

# Crear página de status para health check
RUN mkdir -p /usr/share/nginx/html && \
    echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>EcoBikes App</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f0faf4;}div{text-align:center;padding:40px;border-radius:12px;background:white;box-shadow:0 4px 20px rgba(0,0,0,0.1);}h1{color:#27ae60;}p{color:#555;}</style></head><body><div><h1>🚴 EcoBikes App</h1><p>Pipeline CI/CD activo</p><p style="color:#27ae60;font-weight:bold;">✅ Servicio disponible</p></div></body></html>' \
    > /usr/share/nginx/html/index.html

# Configuración Nginx
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        return 200 "OK"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
