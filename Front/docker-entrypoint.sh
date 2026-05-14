#!/bin/sh
set -e

PORT="${PORT:-80}"
sed -i "s/__PORT__/${PORT}/g" /etc/nginx/conf.d/default.conf

cat > /usr/share/nginx/html/config.js <<EOF
window.__DRIVEON_CONFIG__ = {
  API_URL: "${API_URL:-/api}"
};
EOF

nginx -g "daemon off;"
