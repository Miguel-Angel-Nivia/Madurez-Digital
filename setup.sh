#!/bin/bash
# =============================================================
#  Script de instalación — Madurez Digital 2026
#  Ubuntu 22.04 / 24.04 en Proxmox
#  Ejecutar como root o con sudo: bash setup.sh
# =============================================================

set -e

APP_DIR="/opt/madurez-digital"
WEB_DIR="/var/www/madurez-digital"
DB_NAME="madurez_digital"
DB_USER="madurez_user"
DB_PASS=$(openssl rand -base64 16)   # genera una contraseña aleatoria

echo ""
echo "=== [1/6] Actualizando paquetes ==="
apt update && apt upgrade -y

echo ""
echo "=== [2/6] Instalando Node.js 20, Nginx y PostgreSQL ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx postgresql

echo ""
echo "=== [3/6] Creando base de datos PostgreSQL ==="
sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF
echo "Base de datos '$DB_NAME' y usuario '$DB_USER' creados."

echo ""
echo "=== [4/6] Copiando archivos de la aplicación ==="
mkdir -p $APP_DIR $WEB_DIR

# Copia el backend
cp -r src package.json $APP_DIR/
cp .env.example $APP_DIR/.env

# Actualiza el .env con los valores reales
sed -i "s/tu_usuario/$DB_USER/g"   $APP_DIR/.env
sed -i "s/tu_contraseña/$DB_PASS/g" $APP_DIR/.env
sed -i "s/madurez_digital/$DB_NAME/g" $APP_DIR/.env

# Copia el HTML al directorio web
cp public/index.html $WEB_DIR/

echo ""
echo "=== [5/6] Instalando dependencias Node.js ==="
cd $APP_DIR
npm install --omit=dev

echo ""
echo "=== [6/6] Configurando Nginx y PM2 ==="
# Nginx
cp $(dirname "$0")/nginx.conf /etc/nginx/sites-available/madurez-digital
ln -sf /etc/nginx/sites-available/madurez-digital /etc/nginx/sites-enabled/madurez-digital
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# PM2 (para mantener Node.js corriendo)
npm install -g pm2
cd $APP_DIR
pm2 start src/server.js --name madurez-digital
pm2 startup
pm2 save

echo ""
echo "============================================="
echo "✅ Instalación completada"
echo "---------------------------------------------"
echo "  App backend:  http://localhost:3000"
echo "  Web:          http://$(hostname -I | awk '{print $1}')"
echo "  DB name:      $DB_NAME"
echo "  DB user:      $DB_USER"
echo "  DB password:  $DB_PASS"
echo ""
echo "⚠️  Guarda la contraseña de la BD en un lugar seguro."
echo "    El archivo .env está en: $APP_DIR/.env"
echo "============================================="
