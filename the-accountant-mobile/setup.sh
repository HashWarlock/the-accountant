#!/bin/bash

echo "🚀 The Accountant Mobile - Setup Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}Error: Node.js 20+ is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js version OK: $(node -v)${NC}"
echo ""

# Install root dependencies
echo -e "${BLUE}Installing root dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Root dependencies installed${NC}"
echo ""

# Setup backend
echo -e "${BLUE}Setting up backend...${NC}"
cd packages/backend

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created packages/backend/.env (please configure)${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo "Generating Prisma client..."
npm run db:generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

cd ../..
echo ""

# Setup mobile app
echo -e "${BLUE}Setting up mobile app...${NC}"
cd packages/app

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created packages/app/.env (please configure)${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

cd ../..
echo ""

# Build SDK
echo -e "${BLUE}Building React Native SDK...${NC}"
cd packages/dstack-react-native
npm run build
cd ../..
echo -e "${GREEN}✓ SDK built${NC}"
echo ""

# Final instructions
echo -e "${GREEN}========================================"
echo "✓ Setup complete!"
echo "========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Configure your environment:"
echo "   - Edit packages/backend/.env (DATABASE_URL, JWT_SECRET, etc.)"
echo "   - Edit packages/app/.env (EXPO_PUBLIC_API_ENDPOINT)"
echo ""
echo "2. Setup database:"
echo "   cd packages/backend"
echo "   npm run db:push"
echo ""
echo "3. Start development:"
echo "   npm run dev                  # Run all packages"
echo "   npm run backend:dev          # Run backend only"
echo "   npm run app:dev              # Run mobile app only"
echo ""
echo "4. Access the app:"
echo "   Backend API: http://localhost:4000"
echo "   Mobile App: Scan QR code or press 'w' for web"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
