import { Router } from 'express';
import { z } from 'zod';
import { authenticateSession, AuthRequest, generateSessionToken } from '../middleware/auth.js';
import { createWalletWithAttestation } from '../lib/wallet.js';
import { createAuditLog } from '../lib/audit.js';
import { prisma } from '../lib/db.js';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  userId: z.string().min(3).max(50),
});

const signSchema = z.object({
  message: z.string().min(1).max(10000),
});

const verifySchema = z.object({
  message: z.string().min(1),
  signature: z.string(),
  userId: z.string().optional(),
});

/**
 * POST /wallet/signup - Create new wallet and user
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, userId } = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { userId }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        field: existingUser.email === email ? 'email' : 'userId'
      });
    }

    // Create wallet with attestation
    console.log(`\n🔐 [Wallet] Creating wallet for new user: ${userId}`);
    const wallet = await createWalletWithAttestation(userId, 'signup');

    // Save user to database
    const user = await prisma.user.create({
      data: {
        email,
        userId,
        pubKeyHex: wallet.pubKeyHex,
        address: wallet.address,
      },
      select: {
        id: true,
        email: true,
        userId: true,
        address: true,
        pubKeyHex: true,
        createdAt: true,
      }
    });

    // Create audit log
    await createAuditLog({
      userId: user.userId,
      operation: 'signup',
      attestationQuote: wallet.attestationQuote,
      eventLog: wallet.eventLog,
      attestationChecksum: wallet.attestationChecksum,
      phalaVerificationUrl: wallet.phalaVerificationUrl,
      t16zVerificationUrl: wallet.t16zVerificationUrl,
      applicationData: {
        namespace: process.env.APP_NAMESPACE || 'the-accountant-mobile',
        timestamp: new Date().toISOString(),
      },
      address: user.address,
      publicKey: user.pubKeyHex,
    });

    // Generate session token
    const sessionToken = generateSessionToken(userId);

    console.log(`✅ [Wallet] User created successfully: ${userId}`);

    return res.status(201).json({
      user: {
        userId: user.userId,
        email: user.email,
        address: user.address,
        publicKey: user.pubKeyHex,
        createdAt: user.createdAt,
      },
      sessionToken,
      attestation: wallet.attestationQuote ? {
        quote: wallet.attestationQuote,
        eventLog: wallet.eventLog,
        checksum: wallet.attestationChecksum,
        verificationUrls: {
          phala: wallet.phalaVerificationUrl,
          t16z: wallet.t16zVerificationUrl
        }
      } : undefined
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /wallet/sign - Sign message (requires authentication)
 */
router.post('/sign', authenticateSession, async (req: AuthRequest, res) => {
  try {
    const { message } = signSchema.parse(req.body);
    const userId = req.user!.userId;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { userId: true, address: true, pubKeyHex: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create wallet with attestation for signing
    console.log(`\n🖊️  [Wallet] Signing message for user: ${userId}`);
    const wallet = await createWalletWithAttestation(userId, 'sign', { message });

    // Verify address consistency
    if (wallet.address !== user.address) {
      console.error(`❌ Address mismatch: DB=${user.address}, Derived=${wallet.address}`);
      return res.status(500).json({ error: 'Key derivation inconsistency' });
    }

    // Sign message
    const signature = await wallet.signMessage(message);

    console.log(`✅ [Wallet] Message signed successfully`);

    // Create audit log
    await createAuditLog({
      userId: user.userId,
      operation: 'sign',
      attestationQuote: wallet.attestationQuote,
      eventLog: wallet.eventLog,
      attestationChecksum: wallet.attestationChecksum,
      phalaVerificationUrl: wallet.phalaVerificationUrl,
      t16zVerificationUrl: wallet.t16zVerificationUrl,
      applicationData: {
        namespace: process.env.APP_NAMESPACE || 'the-accountant-mobile',
        timestamp: new Date().toISOString(),
        messageLength: message.length,
      },
      address: user.address,
      publicKey: user.pubKeyHex,
      message,
      signature,
    });

    return res.status(200).json({
      signature,
      address: user.address,
      publicKey: user.pubKeyHex,
      message,
      timestamp: new Date().toISOString(),
      attestation: wallet.attestationQuote ? {
        quote: wallet.attestationQuote,
        eventLog: wallet.eventLog,
        checksum: wallet.attestationChecksum,
        verificationUrls: {
          phala: wallet.phalaVerificationUrl,
          t16z: wallet.t16zVerificationUrl
        }
      } : undefined
    });
  } catch (error) {
    console.error('Sign error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    if (error instanceof Error && error.message.includes('TEE not available')) {
      return res.status(503).json({
        error: 'Signing service unavailable'
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /wallet/verify - Verify signature
 */
router.post('/verify', async (req, res) => {
  try {
    const { message, signature, userId } = verifySchema.parse(req.body);

    const { recoverMessageAddress } = await import('viem');

    // Recover address from signature
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    });

    console.log(`\n🔍 [Wallet] Verifying signature`);
    console.log(`📝 Message: ${message.substring(0, 50)}...`);
    console.log(`🔐 Recovered address: ${recoveredAddress}`);

    let isValid = false;
    let matchedUser = null;

    if (userId) {
      // Verify against specific user
      const user = await prisma.user.findUnique({
        where: { userId },
        select: { userId: true, address: true, email: true }
      });

      if (user) {
        isValid = user.address.toLowerCase() === recoveredAddress.toLowerCase();
        if (isValid) {
          matchedUser = user;
        }
      }
    } else {
      // Find user by recovered address
      const user = await prisma.user.findFirst({
        where: {
          address: {
            equals: recoveredAddress,
            mode: 'insensitive'
          }
        },
        select: { userId: true, address: true, email: true }
      });

      if (user) {
        isValid = true;
        matchedUser = user;
      }
    }

    console.log(`✅ [Wallet] Verification ${isValid ? 'successful' : 'failed'}`);

    return res.status(200).json({
      valid: isValid,
      recoveredAddress,
      user: matchedUser ? {
        userId: matchedUser.userId,
        email: matchedUser.email,
        address: matchedUser.address
      } : null,
      message,
      signature
    });
  } catch (error) {
    console.error('Verify error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /wallet/keys - Get user's public key (requires authentication)
 */
router.get('/keys', authenticateSession, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        address: true,
        pubKeyHex: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      userId: user.userId,
      email: user.email,
      address: user.address,
      publicKey: user.pubKeyHex
    });
  } catch (error) {
    console.error('Get keys error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
