import { Router, Request, Response } from 'express'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server'
import jwt from 'jsonwebtoken'
import { createWallet } from '../lib/wallet.js'

const router = Router()

// In-memory storage for passkey challenges and credentials
// In production, this should be stored in the TEE or database
interface PasskeyCredential {
  id: string
  publicKey: Uint8Array
  counter: number
  userId: string
  email: string
  walletAddress?: string
}

interface Challenge {
  challenge: string
  userId: string
  expiresAt: number
}

const passkeys = new Map<string, PasskeyCredential>()
const challenges = new Map<string, Challenge>()
const userPasskeys = new Map<string, string[]>() // userId -> credentialIds[]

// RP (Relying Party) configuration - dynamically set based on request
const rpName = 'The Accountant'

function getRPConfig(req: Request) {
  // Check x-forwarded-host first (from Vite proxy), then host header
  const forwardedHost = req.get('x-forwarded-host')
  const host = forwardedHost || req.get('host') || 'localhost:8000'
  const hostname = host.split(':')[0]

  console.log('[Passkey] Host detection:', { host, forwardedHost, originalHost: req.get('host') })

  // For dstack domains, use the full subdomain as rpID
  if (hostname.includes('dstack-pha-prod9.phala.network')) {
    return {
      rpID: hostname, // Use the full subdomain for WebAuthn
      origin: `https://${host}`
    }
  }

  // For localhost
  return {
    rpID: 'localhost',
    origin: `http://${host}`
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

// Clean up expired challenges
setInterval(() => {
  const now = Date.now()
  for (const [key, challenge] of challenges.entries()) {
    if (challenge.expiresAt < now) {
      challenges.delete(key)
    }
  }
}, 60000) // Every minute

/**
 * POST /api/passkey/register/begin
 * Initiate passkey registration
 */
router.post('/register/begin', async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' })
    }

    // Check if user already has passkeys registered
    const userCredentialIds = userPasskeys.get(userId) || []
    if (userCredentialIds.length > 0) {
      return res.status(409).json({
        error: 'User already has a passkey registered. Please use "Login with Passkey" instead.',
        code: 'PASSKEY_ALREADY_REGISTERED'
      })
    }

    const { rpID, origin } = getRPConfig(req)

    // Get existing credentials for this user (if any)
    const excludeCredentials = userCredentialIds.map((id) => ({
      id: id,
      type: 'public-key' as const,
    }))

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(userId),
      userName: email,
      userDisplayName: email,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    })

    // Store challenge
    challenges.set(options.challenge, {
      challenge: options.challenge,
      userId,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    })

    res.json(options)
  } catch (error) {
    console.error('Error generating registration options:', error)
    res.status(500).json({ error: 'Failed to generate registration options' })
  }
})

/**
 * POST /api/passkey/register/complete
 * Complete passkey registration
 */
router.post('/register/complete', async (req: Request, res: Response) => {
  try {
    const { userId, email, credential: credentialResponse } = req.body

    if (!userId || !email || !credentialResponse) {
      return res.status(400).json({ error: 'userId, email, and credential are required' })
    }

    const { rpID, origin } = getRPConfig(req)

    // Verify the challenge exists
    const expectedChallenge = challenges.get(credentialResponse.response.clientDataJSON ?
      JSON.parse(Buffer.from(credentialResponse.response.clientDataJSON, 'base64').toString()).challenge :
      '')

    if (!expectedChallenge || expectedChallenge.userId !== userId) {
      return res.status(400).json({ error: 'Invalid or expired challenge' })
    }

    const verification = await verifyRegistrationResponse({
      response: credentialResponse,
      expectedChallenge: expectedChallenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Passkey verification failed' })
    }

    const { credential } = verification.registrationInfo

    // Create wallet for user (deterministic from userId)
    const wallet = await createWallet(userId)
    const walletAddress = wallet.address

    // Store the passkey
    // In v11, credential.id is already base64url encoded
    passkeys.set(credential.id, {
      id: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      userId,
      email,
      walletAddress,
    })

    // Update user's passkey list
    const userCreds = userPasskeys.get(userId) || []
    userCreds.push(credential.id)
    userPasskeys.set(userId, userCreds)

    // Clean up challenge
    challenges.delete(expectedChallenge.challenge)

    // Generate session token
    const sessionToken = jwt.sign(
      { userId, email, walletAddress },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      walletAddress,
      sessionToken,
      credentialId: credential.id,
    })
  } catch (error) {
    console.error('Error completing registration:', error)
    res.status(500).json({ error: 'Failed to complete registration' })
  }
})

/**
 * POST /api/passkey/auth/begin
 * Initiate passkey authentication
 */
router.post('/auth/begin', async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    const { rpID, origin } = getRPConfig(req)

    // Find all credentials for this email
    const allCreds = Array.from(passkeys.values())
    const userCreds = allCreds.filter(c => c.email === email)

    if (userCreds.length === 0) {
      return res.status(404).json({ error: 'No passkeys found for this email' })
    }

    const allowCredentials = userCreds.map((cred) => ({
      id: cred.id,
      type: 'public-key' as const,
    }))

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: 'preferred',
    })

    // Store challenge with the first user's ID (they all should be same email)
    challenges.set(options.challenge, {
      challenge: options.challenge,
      userId: userCreds[0].userId,
      expiresAt: Date.now() + 5 * 60 * 1000,
    })

    res.json(options)
  } catch (error) {
    console.error('Error generating authentication options:', error)
    res.status(500).json({ error: 'Failed to generate authentication options' })
  }
})

/**
 * POST /api/passkey/auth/complete
 * Complete passkey authentication
 */
router.post('/auth/complete', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ error: 'credential is required' })
    }

    const { rpID, origin } = getRPConfig(req)

    // In v11, credential.id is already base64url encoded
    const passkey = passkeys.get(credential.id)

    if (!passkey) {
      return res.status(404).json({ error: 'Passkey not found' })
    }

    // Get challenge
    const clientDataJSON = JSON.parse(
      Buffer.from(credential.response.clientDataJSON, 'base64').toString()
    )
    const expectedChallenge = challenges.get(clientDataJSON.challenge)

    if (!expectedChallenge) {
      return res.status(400).json({ error: 'Invalid or expired challenge' })
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: expectedChallenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.id,
        publicKey: passkey.publicKey,
        counter: passkey.counter,
      },
    })

    if (!verification.verified) {
      return res.status(400).json({ error: 'Authentication failed' })
    }

    // Update counter
    passkey.counter = verification.authenticationInfo.newCounter

    // Clean up challenge
    challenges.delete(expectedChallenge.challenge)

    // Generate session token
    const sessionToken = jwt.sign(
      { userId: passkey.userId, email: passkey.email, walletAddress: passkey.walletAddress },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      userId: passkey.userId,
      email: passkey.email,
      walletAddress: passkey.walletAddress,
      sessionToken,
    })
  } catch (error) {
    console.error('Error completing authentication:', error)
    res.status(500).json({ error: 'Failed to complete authentication' })
  }
})

/**
 * GET /api/passkey/list
 * List all passkeys for a user (requires auth)
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token' })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const userCredentialIds = userPasskeys.get(decoded.userId) || []
    const credentials = userCredentialIds.map((id) => {
      const cred = passkeys.get(id)
      return {
        id: cred?.id,
        email: cred?.email,
        walletAddress: cred?.walletAddress,
        createdAt: new Date().toISOString(), // In production, store actual creation time
      }
    })

    res.json({ credentials })
  } catch (error) {
    console.error('Error listing passkeys:', error)
    res.status(500).json({ error: 'Failed to list passkeys' })
  }
})

export default router
