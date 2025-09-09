# dstack JS SDK Demo - The Accountant

A secure TEE-backed key management system demonstrating the dstack SDK for deterministic wallet generation and cryptographic operations in a Confidential VM environment.

## Features

- **TEE-Backed Security**: Leverages Trusted Execution Environment for secure key generation
- **Deterministic Wallets**: Same user ID always generates the same wallet address
- **Message Signing**: Sign messages with TEE-protected private keys
- **Signature Verification**: Verify signatures against addresses or user IDs
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
- `POST /api/verify` - Verify signature
- `GET /api/users/me/keys` - Get user's public key
- `GET /api/health` - Health check
- `GET /api/admin/users` - List all users (admin)

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

### Local Docker

1. Build the image:
```bash
docker build -t dstack-demo .
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
