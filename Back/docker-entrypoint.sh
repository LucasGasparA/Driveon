#!/bin/sh
set -e

npx prisma migrate deploy --schema prisma/schema.prisma

if [ "${RUN_SEED:-false}" = "true" ]; then
  node -e "console.log('RUN_SEED=true set, but SQL seed should be applied with psql or a seed script.')"
fi

node dist/index.js
