#!/bin/bash

# ... (aquí iría el resto de tu instalación de docker) ...

echo "Añadiendo usuario al grupo docker..."
sudo usermod -aG docker $USER

echo "Ejecutando prueba de Docker sin reiniciar sesión..."
# 'sg' ejecuta el comando como si ya te hubieras deslogueado y vuelto a entrar
sg docker -c "docker ps"

echo "¡Listo! Docker está configurado."