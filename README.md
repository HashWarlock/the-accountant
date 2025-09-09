# dstack JS SDK Demo - The Accountant

A secure TEE-backed key management system demonstrating the dstack SDK for deterministic wallet generation and cryptographic operations in a Confidential VM environment.

## 🚀 Version 1.2.0 - Remote Attestation & Audit Logging

### New Features in v1.2.0
- **Remote Attestation**: Intel TDX attestation quote generation for all key operations
- **Audit Logging System**: Comprehensive audit trail with attestation tracking
- **Attestation Verifier**: UI and API for verifying attestation quotes
- **Audit Log Viewer**: Interactive UI with filtering, search, and export (JSON/CSV)
- **Enhanced Security**: Fixed critical key derivation issue ensuring unique keys per user

## Features

- **TEE-Backed Security**: Leverages Trusted Execution Environment for secure key generation
- **Deterministic Wallets**: Same user ID always generates the same wallet address
- **Message Signing**: Sign messages with TEE-protected private keys
- **Signature Verification**: Verify signatures against addresses or user IDs
- **Remote Attestation**: Generate and verify Intel TDX attestation quotes
- **Audit Trail**: Complete audit logging of all key operations with attestation
- **User Management**: Browse and search registered users with pagination
- **Modern UI**: Built with Next.js 15 and shadcn/ui components

## Security Compliance

This project uses security-hardened dependencies to avoid known vulnerabilities:

- **Next.js 15.5.2** - Exceeds minimum 15.2.3+ requirement (avoids CVE-2025-29927)
- **@noble/curves 2.0.0** - Latest stable cryptographic library
- **js-sha3 0.9.3** - Secure Keccak-256 implementation
- **viem 2.21.58** - Type-safe Ethereum utilities
- **Prisma 6.11.1** - Secure database ORM
- **0 vulnerabilities** - Verified with `npm audit`

All dependencies are pinned to exact versions for reproducible builds.

### Key Derivation Security

**⚠️ CRITICAL SECURITY REQUIREMENT**: This application uses the `APP_NAMESPACE` environment variable to ensure unique key derivation for each user.

**[📖 See SECURITY.md for complete security documentation](./SECURITY.md)**

Quick summary:
1. **Application Namespace**: Uses `APP_NAMESPACE` environment variable (default: `the-accountant-v1`)
2. **User ID Hashing**: SHA256 hashes the userId to create a consistent, unique identifier
3. **Derivation Path**: `wallet/{namespace}/eth/{sha256(userId)}` ensures globally unique keys

**WARNING**: Never share `APP_NAMESPACE` values between different environments (prod/staging/dev).

To configure for your deployment:
```bash
# Production
export APP_NAMESPACE="the-accountant-prod"

# Staging
export APP_NAMESPACE="the-accountant-staging"

# Development
export APP_NAMESPACE="the-accountant-dev"
```

## Tech Stack

- **Framework**: Next.js 15.5.2 (App Router)
- **SDK**: @phala/dstack-sdk 0.5.5
- **Database**: SQLite with Prisma ORM
- **Crypto**: viem for Ethereum operations
- **UI**: shadcn/ui, Tailwind CSS
- **Environment**: Flox for reproducible development

## Quick Start

### Prerequisites

- Node.js 20+ (or use Flox)
- npm or yarn
- Docker (for deployment)
- Access to dstack TEE socket (optional, falls back to development mode)

### Development Setup

1. Clone the repository:
```bash
git clone git@github.com:HashWarlock/the-accountant.git
cd the-accountant
```

2. Using Flox (recommended):
```bash
flox activate
```

3. Install dependencies:
```bash
npm install
```

4. Setup database:
```bash
npx prisma generate
npx prisma db push
```

5. Create `.env` file:
```bash
cp .env.example .env
```

6. Run development server:
```bash
npm run dev
```

Visit http://localhost:3000

## API Endpoints

### Core APIs

- `POST /api/signup` - Create new user wallet
- `POST /api/users/{userId}/sign` - Sign message
- `POST /api/users/{userId}/verify` - Verify signature for specific user
- `POST /api/verify` - Verify signature
- `GET /api/users/me/keys` - Get user's public key
- `GET /api/health` - Health check
- `GET /api/admin/users` - List all users (admin)

### Attestation & Audit APIs (v1.2.0)

- `GET /api/audit/{userId}` - Get audit logs for specific user
- `GET /api/audit` - Get all audit logs (admin)
- `POST /api/attestation/verify` - Verify attestation quote

### Request Examples

#### Create Wallet
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "userId": "alice"}'
```

#### Sign Message
```bash
curl -X POST http://localhost:3000/api/users/alice/sign \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, dstack!"}'
```

#### Verify Signature
```bash
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, dstack!",
    "signature": "0x...",
    "userId": "alice"
  }'
```

## Deployment

### Using Pre-built Image from DockerHub

Pull and run the latest image (v1.2.0):
```bash
docker pull hashwarlock/the-accountant:v1.2.0
docker run -d \
  --name the-accountant \
  -p 3000:3000 \
  -e DATABASE_URL=file:./dev.db \
  -e APP_NAMESPACE=the-accountant-v1 \
  hashwarlock/the-accountant:v1.2.0
```

For TEE-enabled environments:
```bash
docker pull hashwarlock/the-accountant:tee-amd64-latest
docker run -d \
  --name the-accountant-tee \
  -p 3000:3000 \
  -v /var/run/dstack.sock:/var/run/dstack.sock:ro \
  -e DATABASE_URL=file:./dev.db \
  -e APP_NAMESPACE=the-accountant-prod \
  hashwarlock/the-accountant:tee-amd64-latest
```

### Local Docker Build

1. Build the image:
```bash
docker build -t the-accountant .
```

2. Run with docker-compose:
```bash
docker-compose up -d
```

3. Access at http://localhost:3000

### Production Docker

For production with dstack socket:
```bash
docker run -d \
  --name dstack-demo \
  -p 3000:3000 \
  -v /var/run/dstack.sock:/var/run/dstack.sock:ro \
  -v $(pwd)/prisma/dev.db:/app/prisma/dev.db \
  --security-opt no-new-privileges:true \
  --cap-drop ALL \
  --cap-add CHOWN,SETUID,SETGID \
  dstack-demo
```

### Phala CVM Deployment

1. Build and push image:
```bash
docker build -t ghcr.io/hashwarlock/the-accountant:latest .
docker push ghcr.io/hashwarlock/the-accountant:latest
```

2. Deploy using app-compose.json:
```bash
phala-cli deploy --config app-compose.json
```

The app will be available at: https://dstack-demo.phala.network

## Security Features

- **TEE Integration**: All key operations happen in secure enclave
- **No Private Key Exposure**: Keys never leave the TEE
- **Deterministic Derivation**: Reproducible but secure key generation
- **Non-root Container**: Runs as unprivileged user
- **Security Hardening**: Dropped capabilities, read-only filesystem
- **Health Monitoring**: Built-in health checks and metrics

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Prisma database connection | `file:./dev.db` |
| `APP_NAMESPACE` | Namespace for key derivation (CRITICAL) | `the-accountant-v1` |
| `DSTACK_SOCKET_PATH` | Path to dstack TEE socket | `/var/run/dstack.sock` |
| `EXPOSE_INFO` | Show detailed info in health endpoint | `false` |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |

## Development

### Project Structure
```
the-accountant/
├── app/                  # Next.js app router
│   └── api/             # API routes
├── components/          # React components
├── lib/                 # Core libraries
│   ├── dstack.ts       # dstack SDK integration
│   ├── wallet.ts       # Wallet operations
│   └── db.ts           # Database client
├── prisma/             # Database schema
├── public/             # Static assets
├── .flox/              # Flox environment
└── .taskmaster/        # Task management
```

### Testing

Run tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

### Database Management

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

## Troubleshooting

### TEE Not Available

If you see "TEE not available, using development fallback":
- Ensure `/var/run/dstack.sock` exists and is accessible
- Check Docker volume mounts
- Development mode uses mock keys (not secure)

### Database Issues

Reset database:
```bash
rm prisma/dev.db
npx prisma db push
```

### Port Conflicts

If port 3000 is in use:
```bash
PORT=3001 npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT - See LICENSE file for details

## Acknowledgments

- Built with [dstack SDK](https://github.com/Phala-Network/dstack-sdk)
- Powered by [Phala Network](https://phala.network)
- UI components from [shadcn/ui](https://ui.shadcn.com)
