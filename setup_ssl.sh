#!/bin/bash

DOMAIN="bohemiancollections.com"
SUBDOMAIN="www.bohemiancollections.com"
EMAIL="quijanoandrea20@gmail.com"
PROJECT_DIR="/home/ubuntu/project"
CERT_DIR="$PROJECT_DIR/certs"

echo "--- 1. Bajando contenedores para liberar puerto 80 ---"
cd $PROJECT_DIR
docker compose down

echo "--- 2. Instalando Certbot (si no está) ---"
sudo apt update && sudo apt install -y certbot

echo "--- 3. Obteniendo certificados (Modo Standalone) ---"
sudo certbot certonly --standalone -d $DOMAIN -d $SUBDOMAIN --non-interactive --agree-tos -m $EMAIL

echo "--- 4. Copiando certificados al proyecto ---"
mkdir -p $CERT_DIR
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $CERT_DIR/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $CERT_DIR/

echo "--- 5. Ajustando permisos para Docker ---"
sudo chown -R $USER:$USER $CERT_DIR
chmod 644 $CERT_DIR/fullchain.pem
chmod 600 $CERT_DIR/privkey.pem

echo "--- ¡Certificados listos en $CERT_DIR! ---"