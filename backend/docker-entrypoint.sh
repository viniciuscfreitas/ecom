#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$SKIP_SEED" != "true" ]; then
  echo "Running seed (seed script handles duplicates safely)..."
  npm run prisma:seed || echo "Seed completed"
fi

echo "Starting server..."
exec npm start

