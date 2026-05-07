#!/bin/sh
set -e

cat > /usr/share/nginx/html/config.js <<EOF
window.__DRIVEON_CONFIG__ = {
  API_URL: "${API_URL:-/api}"
};
EOF

nginx -g "daemon off;"
