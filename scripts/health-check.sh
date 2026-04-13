#!/bin/bash
# ══════════════════════════════════════════════════════════════════
#  EcoBikes — Health Check de Disponibilidad
#  Uso: ./scripts/health-check.sh <URL>
#  Ejemplo: ./scripts/health-check.sh http://localhost:8080
# ══════════════════════════════════════════════════════════════════

TARGET_URL="${1:-http://localhost:8080}"
MAX_RETRIES=5
RETRY_INTERVAL=5   # segundos entre intentos
TIMEOUT=10         # segundos máximo por request

echo "════════════════════════════════════════════"
echo "  🏥 EcoBikes Health Check"
echo "  🎯 URL: $TARGET_URL"
echo "  🔁 Intentos máximos: $MAX_RETRIES"
echo "════════════════════════════════════════════"

attempt=1
success=false

while [ $attempt -le $MAX_RETRIES ]; do
  echo ""
  echo "🔍 Intento $attempt/$MAX_RETRIES — $(date '+%H:%M:%S')"

  # Ejecutar el request y capturar código HTTP
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time $TIMEOUT \
    --connect-timeout 5 \
    "$TARGET_URL")

  CURL_EXIT=$?

  # Evaluar resultado
  if [ $CURL_EXIT -ne 0 ]; then
    echo "  ❌ Error de conexión (curl exit: $CURL_EXIT)"
  elif [ "$HTTP_CODE" -eq 200 ]; then
    echo "  ✅ HTTP $HTTP_CODE — Servicio disponible"
    success=true
    break
  elif [ "$HTTP_CODE" -ge 500 ]; then
    echo "  ❌ HTTP $HTTP_CODE — Error del servidor"
  elif [ "$HTTP_CODE" -ge 400 ]; then
    echo "  ⚠️  HTTP $HTTP_CODE — Error del cliente"
  else
    echo "  ⚠️  HTTP $HTTP_CODE — Respuesta inesperada"
  fi

  if [ $attempt -lt $MAX_RETRIES ]; then
    echo "  ⏳ Reintentando en ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
  fi

  attempt=$((attempt + 1))
done

echo ""
echo "════════════════════════════════════════════"

if [ "$success" = true ]; then
  echo "  🟢 RESULTADO: DISPONIBLE"
  echo "  📊 Servicio respondió correctamente en el intento $((attempt - 1))"
  echo "════════════════════════════════════════════"
  exit 0
else
  echo "  🔴 RESULTADO: NO DISPONIBLE"
  echo "  ⛔ El servicio no respondió tras $MAX_RETRIES intentos"
  echo "════════════════════════════════════════════"
  exit 1
fi
