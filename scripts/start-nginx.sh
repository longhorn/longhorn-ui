#!/bin/bash

set -e

TEMPLATE=/etc/nginx/nginx.conf.template
CONFIG_DIR=/var/config/nginx
FINAL_CONF=$CONFIG_DIR/nginx.conf

mkdir -p $CONFIG_DIR
cp -r /etc/nginx/* $CONFIG_DIR

# Detect IPv6 only
if ip -6 addr show scope global | grep -q inet6; then
    echo "IPv6 detected, enabling IPv6 listen on port ${LONGHORN_UI_PORT}"
    export IPV6_LISTEN="listen [::]:${LONGHORN_UI_PORT};"
else
    echo "No IPv6 address detected, running in IPv4-only mode..."
    export IPV6_LISTEN=""
fi

# Generate Nginx config dynamically
envsubst '${LONGHORN_MANAGER_IP},${LONGHORN_UI_PORT},${IPV6_LISTEN}' \
    < $TEMPLATE > $FINAL_CONF

# Start Nginx
nginx -c $FINAL_CONF -g 'daemon off;'
