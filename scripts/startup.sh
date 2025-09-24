#!/bin/sh
# Startup script for production deployment
# Ensures database migrations are applied before starting the app

echo "🚀 Starting The Accountant v1.5.3..."

# Debug: Show environment
echo "📝 Database URL: ${DATABASE_URL}"
echo "📝 Current directory: $(pwd)"
echo "📝 Directory contents:"
ls -la

# Check if migrations exist
echo "📝 Checking for migration files..."
if [ -d "prisma/migrations" ]; then
  echo "✅ Migration directory exists"
  ls -la prisma/migrations/
else
  echo "❌ Migration directory not found!"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Apply database migrations
echo "📊 Applying database migrations..."
npx prisma migrate deploy

# Check if migrations succeeded
if [ $? -ne 0 ]; then
  echo "❌ Failed to apply database migrations"

  # Try to create tables directly as fallback
  echo "🔧 Attempting to push schema directly..."
  npx prisma db push --skip-generate

  if [ $? -ne 0 ]; then
    echo "❌ Failed to create database schema"
    exit 1
  fi
fi

echo "✅ Database setup completed successfully"

# Create cache directory if it doesn't exist (as root)
mkdir -p /app/.next/cache
mkdir -p /app/.next/cache/images
chown -R nextjs:nodejs /app/.next
chmod -R 755 /app/.next/cache

# Switch to nextjs user for running the app
echo "👤 Switching to nextjs user..."

# Start the Next.js application as nextjs user
echo "🌐 Starting Next.js server..."
exec su -s /bin/sh nextjs -c "node server.js"