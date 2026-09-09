#!/bin/sh
set -eu

candidate=/tmp/Caddyfile.shanhaiyy.https
target=/opt/writing-assistant/Caddyfile
backup="/opt/writing-assistant/Caddyfile.pre-https-$(date +%Y%m%d-%H%M%S)"
container=writing-assistant-caddy

sudo cp -a "$target" "$backup"
sudo cp "$candidate" "$target"

if ! sudo docker exec "$container" caddy validate --config /etc/caddy/Caddyfile; then
    sudo cp "$backup" "$target"
    echo "Caddy validation failed; restored $backup" >&2
    exit 1
fi

if ! sudo docker exec "$container" caddy reload --config /etc/caddy/Caddyfile; then
    sudo cp "$backup" "$target"
    sudo docker exec "$container" caddy reload --config /etc/caddy/Caddyfile
    echo "Caddy reload failed; restored $backup" >&2
    exit 1
fi

echo "HTTPS_CONFIG_RELOADED backup=$backup"
