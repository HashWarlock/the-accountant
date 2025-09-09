# dstack JS SDK Demo

A production-ready demo application showcasing the dstack JS SDK for deterministic wallet derivation, message signing, and signature verification in a Confidential VM environment.

## Security Compliance

This project uses security-hardened dependencies to avoid known vulnerabilities:

- **Next.js 15.5.2** - Exceeds minimum 15.2.3+ requirement (avoids CVE-2025-29927)
- **@noble/curves 2.0.0** - Latest stable cryptographic library
- **js-sha3 0.9.3** - Secure Keccak-256 implementation
- **viem 2.21.58** - Type-safe Ethereum utilities
- **Prisma 6.11.1** - Secure database ORM
- **0 vulnerabilities** - Verified with `npm audit`

All dependencies are pinned to exact versions for reproducible builds.

## Development Environment

This project uses [Flox](https://flox.dev) for reproducible development environments.

### Prerequisites

1. Install Flox: `brew install flox` (macOS) or see [installation guide](https://flox.dev/docs/install)
2. Activate environment: `flox activate`

### Getting Started

First, activate Flox and run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
