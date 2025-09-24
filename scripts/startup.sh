#!/bin/sh
# Startup script for production deployment
# Ensures database migrations are applied before starting the app

echo "🚀 Starting The Accountant v1.5.6..."

echo "📝 Database URL configured"
echo "📝 Working directory: $(pwd)"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for database to be ready..."
for i in $(seq 1 30); do
  if npx prisma db pull --print 2>/dev/null | grep -q "User"; then
    echo "✅ Database is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "⚠️ Database might not be ready, continuing anyway..."
  fi
  sleep 1
done

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Try to apply migrations first
echo "📊 Applying database migrations..."
if npx prisma migrate deploy 2>/dev/null; then
  echo "✅ Migrations applied successfully"
else
  echo "⚠️ Migrations failed or don't exist, pushing schema directly..."
  # Push the schema to create tables
  if npx prisma db push --skip-generate; then
    echo "✅ Database schema created successfully"
  else
    echo "❌ Failed to create database schema"
    exit 1
  fi
fi

# Verify tables exist
echo "🔍 Verifying database tables..."
npx prisma db pull --print | grep -E "(User|AuditLog)" && echo "✅ Tables verified"

# Start the Next.js application as nextjs user
echo "🌐 Starting Next.js server..."
exec su -s /bin/sh nextjs -c "node server.js"