# dstack JS SDK Demo - The Accountant

## Project Overview
A secure TEE-backed key management system demonstrating the dstack SDK for deterministic wallet generation and cryptographic operations in a Confidential VM environment. This is a Next.js application with PostgreSQL database that has been successfully configured to run in the Replit environment.

## Recent Changes
**Date**: September 23, 2025
- **GitHub Import Setup**: Successfully imported and configured the project from GitHub
- **Database Migration**: Converted from SQLite to PostgreSQL to utilize Replit's built-in database
- **Next.js Configuration**: Updated for Replit proxy compatibility with allowedDevOrigins
- **Port Configuration**: Set up development server on port 5000 with 0.0.0.0 binding
- **Deployment Configuration**: Configured autoscale deployment with build and start commands

## Project Architecture
- **Framework**: Next.js 15.5.2 (App Router)
- **SDK**: @phala/dstack-sdk 0.5.5
- **Database**: PostgreSQL with Prisma ORM (migrated from SQLite)
- **UI**: shadcn/ui components with Tailwind CSS
- **Environment**: Replit with configured workflows

## Key Configuration Changes for Replit
1. **Database**: Modified prisma/schema.prisma to use PostgreSQL provider
2. **Next.js Config**: Added allowedDevOrigins for Replit proxy compatibility
3. **Package.json**: Updated dev script to bind to 0.0.0.0:5000
4. **Workflow**: Frontend workflow configured for port 5000 with webview output
5. **Deployment**: Autoscale deployment with npm build and start commands

## Environment Variables (Managed by Replit)
- `DATABASE_URL`: PostgreSQL connection string (auto-configured)
- `APP_NAMESPACE`: Set to "the-accountant-replit-dev" for unique key derivation
- Additional variables available via Replit secrets management

## API Endpoints
- Health check: `/api/health` - Returns system status and database connectivity
- User signup: `/api/signup` - Create new user wallet
- Message signing: `/api/users/{userId}/sign` - Sign messages with TEE-protected keys
- Signature verification: `/api/verify` - Verify signatures
- Admin endpoints: `/api/admin/users` - User management
- Audit endpoints: `/api/audit` - Audit logging system

## Development Workflow
The application runs on port 5000 in development mode with hot reload enabled. The health API confirms all systems are operational with database connectivity verified.

## Current Status
- ✅ Successfully running in Replit environment
- ✅ Database connected and migrations applied
- ✅ All API endpoints functional
- ✅ Frontend serving correctly with proxy configuration
- ✅ Ready for deployment