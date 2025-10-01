import { Router } from 'express';
import { z } from 'zod';
import { generateSessionToken, refreshSessionToken } from '../middleware/auth.js';
import { prisma } from '../lib/db.js';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  userId: z.string().min(3).max(50),
});

const refreshSchema = z.object({
  token: z.string(),
});

/**
 * POST /auth/session - Create new session for user
 */
router.post('/session', async (req, res) => {
  try {
    const { userId } = loginSchema.parse(req.body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { userId: true, email: true, address: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate session token
    const sessionToken = generateSessionToken(userId);

    console.log(`✅ [Auth] Session created for user: ${userId}`);

    return res.status(200).json({
      sessionToken,
      user: {
        userId: user.userId,
        email: user.email,
        address: user.address
      },
      expiresIn: '15m'
    });
  } catch (error) {
    console.error('Session creation error:', error);

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
 * POST /auth/refresh - Refresh session token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { token } = refreshSchema.parse(req.body);

    const newToken = refreshSessionToken(token);

    console.log(`✅ [Auth] Session refreshed`);

    return res.status(200).json({
      sessionToken: newToken,
      expiresIn: '15m'
    });
  } catch (error) {
    console.error('Token refresh error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    return res.status(401).json({
      error: 'Token refresh failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
