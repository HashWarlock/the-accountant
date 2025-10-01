# Migration Guide: Next.js → Expo React Native

This guide explains how The Accountant was transformed from a Next.js web application to a cross-platform mobile app using Expo React Native.

## Architecture Changes

### Before (Next.js)
```
the-accountant/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── page.tsx           # Pages
├── components/            # React components
├── lib/                   # dstack SDK integration
└── prisma/               # Database schema
```

### After (Expo React Native Monorepo)
```
the-accountant-mobile/
├── packages/
│   ├── backend/          # Express API (extracted from Next.js)
│   ├── dstack-react-native/  # Reusable SDK
│   └── app/              # Expo mobile app
```

## Key Technical Decisions

### 1. Backend: Next.js API Routes → Express

**Why?** Next.js API routes are tightly coupled to the web framework. Express provides a standalone API that can serve mobile, web, and other clients.

**Changes:**
- Converted Next.js API routes to Express routes
- Added JWT-based session management (replaced URL-based userId)
- Kept all dstack SDK logic unchanged (lib/dstack.ts, lib/wallet.ts)

**Example:**

**Before (Next.js):**
```typescript
// app/api/users/[userId]/sign/route.ts
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  const { message } = await request.json();
  const user = await prisma.user.findUnique({ where: { userId: params.userId } });
  // ...
}
```

**After (Express):**
```typescript
// packages/backend/src/routes/wallet.ts
router.post('/sign', authenticateSession, async (req: AuthRequest, res) => {
  const { message } = req.body;
  const userId = req.user!.userId; // From JWT token
  const user = await prisma.user.findUnique({ where: { userId } });
  // ...
});
```

### 2. Frontend: React → React Native

**Why?** React Native allows building iOS, Android, and Web apps from a single codebase with native performance.

**UI Library Changes:**
- **Before**: shadcn/ui (Radix UI + Tailwind CSS)
- **After**: React Native Paper (Material Design 3)

**Navigation Changes:**
- **Before**: Next.js App Router (file-based)
- **After**: Expo Router v3 (file-based, same pattern!)

**Styling Changes:**
- **Before**: Tailwind CSS classes
- **After**: StyleSheet.create() (native)

**Example:**

**Before (Next.js + shadcn/ui):**
```tsx
import { Button } from '@/components/ui/button';

<Button
  className="bg-phala-lime text-black"
  onClick={handleSubmit}
>
  Create Wallet
</Button>
```

**After (React Native Paper):**
```tsx
import { Button } from 'react-native-paper';

<Button
  mode="contained"
  onPress={handleSubmit}
  style={styles.button}
>
  Create Wallet
</Button>

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#CDFF6A',
  },
});
```

### 3. State Management: Client-Side → SDK with React Query

**Why?** Mobile apps need offline support, caching, and optimistic updates. React Query provides this out-of-the-box.

**Before (Next.js):**
- Direct API calls with fetch
- useState for local state
- No persistent session

**After (React Native SDK):**
- Centralized API client
- React Query for caching
- Expo SecureStore for persistence

**Example:**

**Before:**
```tsx
const [loading, setLoading] = useState(false);

const handleSignup = async () => {
  setLoading(true);
  const res = await fetch('/api/signup', {
    method: 'POST',
    body: JSON.stringify({ email, userId })
  });
  const data = await res.json();
  setLoading(false);
};
```

**After:**
```tsx
import { useDstackWallet } from '@dstack/react-native';

const { signup, isSigningUp } = useDstackWallet();

const handleSignup = async () => {
  await signup({ email, userId });
  // Session automatically saved to SecureStore
  // React Query updates cache
};
```

### 4. Authentication: URL-based → JWT Sessions

**Security Improvement:** JWT tokens stored in encrypted SecureStore instead of passing userId in URLs.

**Before:**
```
POST /api/users/alice/sign
```

**After:**
```
POST /api/wallet/sign
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## SDK Architecture (Following openfort-react Pattern)

The `@dstack/react-native` SDK follows the same architecture as `openfort-react`:

### Provider Pattern
```tsx
<DstackProvider config={{ apiEndpoint, appNamespace }}>
  <App />
</DstackProvider>
```

### Custom Hooks
- `useDstackWallet()` - Wallet operations (signup, connect, disconnect)
- `useDstackSign()` - Signing and verification
- `useAuditLog()` - Audit trail

### Platform Adapters
- **Mobile**: API calls to backend + SecureStore
- **Web**: API calls to backend + localStorage (future)

## Data Flow

### Old Flow (Next.js)
```
Browser → Next.js API Route → dstack SDK → TEE → Response
```

### New Flow (React Native)
```
Mobile App → Express API → dstack SDK → TEE → Response
     ↓
SecureStore (session persistence)
```

## Database Schema

**Unchanged!** The database schema remains identical:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  userId    String   @unique
  pubKeyHex String
  address   String
  createdAt DateTime @default(now())
  auditLogs AuditLog[]
}

model AuditLog {
  id                   String   @id @default(cuid())
  userId               String
  operation            String
  attestationQuote     String?
  // ... same fields
}
```

## Platform-Specific Considerations

### iOS
- Uses Expo SecureStore (Keychain)
- Requires camera permissions (future QR code scanning)
- App Store submission via EAS Build

### Android
- Uses Expo SecureStore (EncryptedSharedPreferences)
- Google Play submission via EAS Build

### Web (PWA)
- Falls back to localStorage (less secure)
- Service worker for offline support
- Manifest.json for "Add to Home Screen"

## Migration Checklist

- [x] Extract backend to Express
- [x] Migrate dstack logic (unchanged)
- [x] Create React Native SDK package
- [x] Build DstackProvider with hooks
- [x] Initialize Expo app with Expo Router
- [x] Implement all screens (Home, Signup, Sign, Verify, Audit)
- [x] Add JWT authentication
- [x] Configure PWA settings
- [x] Write documentation

## Breaking Changes

### For End Users
- **URL structure changed**: No more `/api/users/[userId]` endpoints
- **Session required**: Must login/signup to use signing features
- **Mobile-first UI**: Optimized for touch, not mouse

### For Developers
- **Import paths**: `@/components/ui/button` → `react-native-paper`
- **Styling**: Tailwind classes → StyleSheet objects
- **Navigation**: `useRouter()` from next/navigation → expo-router
- **Storage**: Direct API calls → SDK hooks

## Performance Improvements

1. **Faster Initial Load**: Native app vs. web bundle
2. **Offline Support**: React Query caching + SecureStore
3. **Optimistic Updates**: Immediate UI feedback
4. **Code Splitting**: Per-route lazy loading (Expo Router)

## Security Enhancements

1. **Encrypted Storage**: SecureStore uses hardware-backed encryption
2. **Short-Lived Tokens**: 15-minute JWT expiration (vs. stateless sessions)
3. **No URL Exposure**: Session tokens in headers, not URLs
4. **Same TEE Security**: All dstack operations unchanged

## Next Steps

### Phase 1: Core Features (Completed)
- ✅ Wallet creation
- ✅ Message signing
- ✅ Signature verification
- ✅ Audit logs

### Phase 2: Enhanced UX (Future)
- [ ] Biometric authentication
- [ ] QR code signing
- [ ] Push notifications
- [ ] Fingerprint verification

### Phase 3: Advanced Features (Future)
- [ ] Multi-signature support
- [ ] Hardware wallet integration
- [ ] Batch signing
- [ ] Transaction simulation

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Paper](https://reactnativepaper.com)
- [TanStack Query](https://tanstack.com/query)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
