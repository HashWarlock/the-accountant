#!/bin/sh
# Startup script for production deployment
# Ensures database migrations are applied before starting the app

echo "🚀 Starting The Accountant v1.3.6..."

# Apply database migrations
echo "📊 Applying database migrations..."
npx prisma migrate deploy

# Check if migrations succeeded
if [ $? -ne 0 ]; then
  echo "❌ Failed to apply database migrations"
  exit 1
fi

echo "✅ Database migrations applied successfully"

# Start the Next.js application
echo "🌐 Starting Next.js server..."
exec node server.js