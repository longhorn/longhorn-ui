#!/bin/bash

NAMESERVER_IP="$(grep -E '^nameserver' /etc/resolv.conf | head -n 1 | awk '{print $2}')"
LONGHORN_NAMESPACE_DOMAIN="$(grep -E '^search' /etc/resolv.conf | head -n 1 | awk '{print $2}')"

export NAMESERVER_IP
export LONGHORN_NAMESPACE_DOMAIN

envsubst '${LONGHORN_MANAGER_IP},${LONGHORN_UI_PORT},${LONGHORN_NAMESPACE_DOMAIN},${NAMESERVER_IP}' \
  < /etc/nginx/nginx.conf.template \
  > /var/config/nginx/nginx.conf

nginx -c /var/config/nginx/nginx.conf
