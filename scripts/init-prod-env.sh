#!/usr/bin/env sh
set -eu

OUTPUT_PATH="${OUTPUT_PATH:-.env.prod}"
BACKEND_IMAGE="${BACKEND_IMAGE:-eventus-plus-backend:ci}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-eventus-plus-frontend:ci}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@eventusplus.local}"
ADMIN_NAME="${ADMIN_NAME:-Administrador}"
FORCE="${FORCE:-false}"

if [ -f "$OUTPUT_PATH" ] && [ "$FORCE" != "true" ]; then
  echo "Arquivo $OUTPUT_PATH ja existe. Use FORCE=true para recriar."
  exit 1
fi

new_hex_secret() {
  bytes="${1:-32}"
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex "$bytes"
    return
  fi

  od -An -N "$bytes" -tx1 /dev/urandom | tr -d ' \n'
}

MYSQL_PASSWORD="$(new_hex_secret 24)"
MYSQL_ROOT_PASSWORD="$(new_hex_secret 24)"
JWT_SECRET="$(new_hex_secret 48)"
ADMIN_PASSWORD="$(new_hex_secret 18)"

cat > "$OUTPUT_PATH" <<EOF
# Production Compose
FRONTEND_PORT=80
MYSQL_DATABASE=eventus_plus
MYSQL_USER=eventus_app
MYSQL_PASSWORD=$MYSQL_PASSWORD
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD

# Images published by CD
BACKEND_IMAGE=$BACKEND_IMAGE
FRONTEND_IMAGE=$FRONTEND_IMAGE

# Backend / Spring Boot
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION_MS=3600000
ADMIN_NAME=$ADMIN_NAME
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
CORS_ALLOWED_ORIGINS=https://seu-dominio.com
LOG_LEVEL=INFO
EOF

echo "Arquivo $OUTPUT_PATH criado com segredos fortes."
echo "Guarde a senha inicial do admin em um cofre antes do primeiro deploy."
