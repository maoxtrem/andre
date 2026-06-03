#!/bin/bash

# Abortar si hay errores
set -e

echo "--- Iniciando instalación de Docker para Ubuntu 22.04 (AWS) ---"

# 1. Limpieza de versiones antiguas (si existen)
sudo apt-get remove -y docker docker-engine docker.io containerd runc || true

# 2. Actualización de repositorios e instalación de dependencias
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 3. Preparar el llavero (keyring) de seguridad
sudo mkdir -p /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
fi

# 4. Configurar el repositorio estable
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Instalar Engine, CLI y Compose V2
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Configuración de permisos para el usuario actual
echo "--- Configurando permisos de usuario ---"
if ! getent group docker > /dev/null; then
    sudo groupadd docker
fi
sudo usermod -aG docker $USER

# 7. Habilitar el servicio para que inicie con el sistema
sudo systemctl enable docker.service
sudo systemctl enable containerd.service

echo "--- ¡Instalación completada con éxito! ---"
echo "IMPORTANTE: Para aplicar los cambios de grupo, cierra tu sesión SSH y vuelve a entrar."