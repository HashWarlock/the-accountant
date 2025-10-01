import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '15m'; // 15 minutes

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    sessionId: string;
  };
}

/**
 * Generate JWT session token
 */
export function generateSessionToken(userId: string): string {
  const sessionId = crypto.randomUUID();

  return jwt.sign(
    { userId, sessionId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verify JWT session token
 */
export function verifySessionToken(token: string): { userId: string; sessionId: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; sessionId: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired session token');
  }
}

/**
 * Authentication middleware
 */
export async function authenticateSession(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No session token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifySessionToken(token);

    // Attach user context to request
    req.user = {
      userId: decoded.userId,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Refresh session token
 */
export function refreshSessionToken(oldToken: string): string {
  try {
    const decoded = verifySessionToken(oldToken);
    return generateSessionToken(decoded.userId);
  } catch (error) {
    throw new Error('Cannot refresh expired token');
  }
}
