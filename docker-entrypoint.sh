#!/bin/sh
set -e

if [ -d "/app/prisma" ]; then
  npx prisma migrate deploy
fi

exec "$@"
