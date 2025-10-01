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
import { deriveAddress } from '@phala/dstack-sdk'

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

// RP (Relying Party) configuration
const rpName = 'The Accountant'
const rpID = 'localhost'
const origin = `http://${rpID}:8081`

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

    // Get existing credentials for this user (if any)
    const userCredentialIds = userPasskeys.get(userId) || []
    const excludeCredentials = userCredentialIds.map((id) => ({
      id: id,
      type: 'public-key' as const,
    }))

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userId,
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
    const { userId, email, credential } = req.body

    if (!userId || !email || !credential) {
      return res.status(400).json({ error: 'userId, email, and credential are required' })
    }

    // Verify the challenge exists
    const expectedChallenge = challenges.get(credential.response.clientDataJSON ?
      JSON.parse(Buffer.from(credential.response.clientDataJSON, 'base64').toString()).challenge :
      '')

    if (!expectedChallenge || expectedChallenge.userId !== userId) {
      return res.status(400).json({ error: 'Invalid or expired challenge' })
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: expectedChallenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Passkey verification failed' })
    }

    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo

    // Derive wallet address from userId (deterministic)
    const walletAddress = await deriveAddress(userId, 0)

    // Store the passkey
    const credentialIdStr = Buffer.from(credentialID).toString('base64')
    passkeys.set(credentialIdStr, {
      id: credentialIdStr,
      publicKey: credentialPublicKey,
      counter,
      userId,
      email,
      walletAddress,
    })

    // Update user's passkey list
    const userCreds = userPasskeys.get(userId) || []
    userCreds.push(credentialIdStr)
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
      credentialId: credentialIdStr,
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

    const credentialIdStr = Buffer.from(credential.id, 'base64').toString('base64')
    const passkey = passkeys.get(credentialIdStr)

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
      authenticator: {
        credentialID: Buffer.from(passkey.id, 'base64'),
        credentialPublicKey: passkey.publicKey,
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
