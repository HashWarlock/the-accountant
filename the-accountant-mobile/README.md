# The Accountant Mobile

A cross-platform mobile application (iOS, Android, PWA) for TEE-backed deterministic key management using dstack SDK. Built with Expo React Native and following the openfort-react SDK pattern.

## 🚀 Features

- **Cross-Platform**: Single codebase for iOS, Android, and Web (PWA)
- **TEE-Backed Security**: Leverages Trusted Execution Environment via dstack SDK
- **Deterministic Wallets**: Same user ID always generates the same wallet address
- **Message Signing**: Sign messages with TEE-protected private keys
- **Signature Verification**: Verify signatures against addresses or user IDs
- **Remote Attestation**: Generate and verify Intel TDX attestation quotes
- **Audit Trail**: Complete audit logging with blockchain verification
- **React Native SDK**: Reusable `@dstack/react-native` package for other apps

## 📦 Project Structure

```
the-accountant-mobile/
├── packages/
│   ├── backend/                    # Express API with TEE access
│   │   ├── src/
│   │   │   ├── routes/             # API routes (auth, wallet, audit, admin)
│   │   │   ├── lib/                # dstack SDK integration
│   │   │   ├── middleware/         # JWT auth middleware
│   │   │   └── server.ts           # Express server
│   │   ├── prisma/                 # Database schema
│   │   └── package.json
│   │
│   ├── dstack-react-native/        # React Native SDK
│   │   ├── src/
│   │   │   ├── providers/          # DstackProvider
│   │   │   ├── hooks/              # useDstackWallet, useDstackSign, useAuditLog
│   │   │   └── utils/              # API client, storage, types
│   │   └── package.json
│   │
│   └── app/                        # Expo React Native app
│       ├── app/                    # Expo Router screens
│       ├── components/             # UI components
│       └── package.json
│
├── package.json                    # Workspace root
├── turbo.json                      # Turborepo config
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js with TypeScript
- **SDK**: @phala/dstack-sdk 0.5.5
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT session tokens (15min expiry)
- **Security**: Helmet, CORS, Rate Limiting

### React Native SDK
- **Framework**: React Native
- **State**: TanStack Query (React Query)
- **Storage**: Expo SecureStore (encrypted)
- **Types**: Full TypeScript support

### Mobile App
- **Framework**: Expo SDK 51
- **Router**: Expo Router v3 (file-based routing)
- **UI**: React Native Paper (Material Design 3)
- **Platforms**: iOS, Android, Web (PWA)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL database
- Docker (for TEE environment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd the-accountant-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Set up backend environment:
```bash
cd packages/backend
cp .env.example .env
# Edit .env with your configuration
```

4. Set up database:
```bash
cd packages/backend
npm run db:push
```

5. Set up mobile app environment:
```bash
cd packages/app
cp .env.example .env
# Edit .env with your API endpoint
```

### Development

Run all packages in development mode:

```bash
# From root directory
npm run dev
```

Or run individual packages:

```bash
# Backend API
npm run backend:dev

# Mobile app
npm run app:dev
```

### Running on Devices

**iOS Simulator:**
```bash
cd packages/app
npm run ios
```

**Android Emulator:**
```bash
cd packages/app
npm run android
```

**Web Browser:**
```bash
cd packages/app
npm run web
```

## 📱 Mobile App Screens

### Home Screen (`/`)
- Connection status
- Quick actions (Create Wallet, Sign Message, View Audit)
- Feature highlights

### Signup Screen (`/signup`)
- Email and User ID input
- TEE wallet creation
- Automatic session creation

### Sign Screen (`/sign`)
- Message input
- TEE signing with attestation
- Copy signature and verification URL

### Verify Screen (`/verify`)
- Message and signature input
- Signature verification
- Signer identification

### Audit Screen (`/audit`)
- Activity history
- Operation filtering
- Blockchain attestation links

## 🔐 Security Architecture

### Session Management
- JWT tokens with 15-minute expiration
- Stored in Expo SecureStore (hardware-encrypted)
- Automatic token refresh
- Secure logout (clears all local data)

### TEE Integration
- All key operations happen server-side in TEE
- APP_NAMESPACE enforced at backend (not exposed to client)
- Intel TDX attestation for all signatures
- Public blockchain verification

### API Security
- CORS protection
- Rate limiting (100 req/15min per IP)
- Helmet security headers
- Input validation with Zod

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/session` - Create session for existing user
- `POST /api/auth/refresh` - Refresh session token

### Wallet Operations
- `POST /api/wallet/signup` - Create new wallet
- `POST /api/wallet/sign` - Sign message (requires auth)
- `POST /api/wallet/verify` - Verify signature
- `GET /api/wallet/keys` - Get wallet keys (requires auth)

### Audit Logs
- `GET /api/audit/logs` - Get audit logs (requires auth)
- `GET /api/audit/logs/:logId` - Get specific log entry
- `GET /api/audit/export` - Export logs as JSON/CSV

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:userId` - Get user details
- `GET /api/admin/stats` - Platform statistics

### Health
- `GET /health` - Health check with TEE status

## 📚 Using the SDK

You can use `@dstack/react-native` in your own React Native apps:

### Installation

```bash
npm install @dstack/react-native @tanstack/react-query expo-secure-store
```

### Setup

```tsx
import { DstackProvider } from '@dstack/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DstackProvider
        config={{
          apiEndpoint: 'https://api.yourapp.com',
          appNamespace: 'your-app-name',
          debug: __DEV__,
        }}
      >
        {/* Your app */}
      </DstackProvider>
    </QueryClientProvider>
  );
}
```

### Usage

```tsx
import { useDstackWallet, useDstackSign } from '@dstack/react-native';

function MyComponent() {
  const { address, signup, connect, disconnect } = useDstackWallet();
  const { sign, verify } = useDstackSign();

  // Create wallet
  await signup({ email: 'alice@example.com', userId: 'alice' });

  // Connect existing user
  await connect('alice');

  // Sign message
  const result = await sign('Hello, dstack!');

  // Verify signature
  const verified = await verify({
    message: 'Hello, dstack!',
    signature: result.signature,
  });
}
```

## 🌐 PWA Support

The app automatically builds as a Progressive Web App when deployed to web:

```bash
cd packages/app
npm run build:web
```

Features:
- Offline support
- Add to home screen
- Mobile-optimized UI
- Service worker caching

## 🚢 Deployment

### Backend Deployment (Railway/Render)

1. Set environment variables:
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
APP_NAMESPACE=your-app-prod
ENABLE_ATTESTATION_UPLOAD=true
```

2. Deploy:
```bash
cd packages/backend
npm run build
npm start
```

### Mobile App Deployment

**iOS (App Store):**
```bash
cd packages/app
npm run build:ios
```

**Android (Play Store):**
```bash
cd packages/app
npm run build:android
```

**Web (Vercel/Netlify):**
```bash
cd packages/app
npm run build:web
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

## 📝 Environment Variables

### Backend (`packages/backend/.env`)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
APP_NAMESPACE=the-accountant-mobile-prod
NODE_ENV=production
PORT=4000
ENABLE_ATTESTATION_UPLOAD=true
```

### Mobile App (`packages/app/.env`)
```bash
EXPO_PUBLIC_API_ENDPOINT=https://api.yourapp.com
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [dstack SDK](https://github.com/Phala-Network/dstack-sdk)
- Powered by [Phala Network](https://phala.network)
- Inspired by [openfort-react](https://github.com/openfort-xyz/openfort-react)
- UI components from [React Native Paper](https://reactnativepaper.com)

## 🔗 Links

- [dstack SDK Documentation](https://docs.phala.network)
- [Expo Documentation](https://docs.expo.dev)
- [React Native Paper](https://reactnativepaper.com)
- [TanStack Query](https://tanstack.com/query)
