#!/bin/sh
set -e

npx prisma migrate deploy --schema prisma/schema.prisma

if [ "${RUN_SEED_ADMIN:-false}" = "true" ]; then
  npm run seed:admin
fi

node dist/index.js
