import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createWallet, createWalletWithAttestation } from '@/lib/wallet'
import { createAuditLog } from '@/lib/audit'

// Validation schema for signup request
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  userId: z.string().min(3, 'User ID must be at least 3 characters').max(50, 'User ID must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'User ID can only contain letters, numbers, underscores, and hyphens')
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = signupSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { userId: validatedData.userId }
        ]
      }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'User already exists',
          field: existingUser.email === validatedData.email ? 'email' : 'userId'
        },
        { status: 409 }
      )
    }
    
    // Generate deterministic wallet using dstack with attestation
    console.log(`\n🔐 ========== WALLET CREATION STARTED ==========`)
    console.log(`👤 User ID: ${validatedData.userId}`)
    console.log(`📧 Email: ${validatedData.email}`)
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
    
    // Try to create wallet with attestation, fall back to regular if it fails
    let wallet
    try {
      wallet = await createWalletWithAttestation(validatedData.userId, 'signup')
    } catch (error) {
      console.warn(`⚠️ Failed to create wallet with attestation, falling back to regular:`, error)
      wallet = await createWallet(validatedData.userId)
    }
    
    console.log(`\n✅ ========== WALLET GENERATED SUCCESSFULLY ==========`)
    console.log(`🔑 PUBLIC KEY: ${wallet.publicKey}`)
    console.log(`📍 ETH ADDRESS: ${wallet.address}`)
    console.log(`🆔 User ID: ${wallet.userId}`)
    console.log(`📝 Public Key Hex: ${wallet.pubKeyHex}`)
    console.log(`🔍 Public Key === PubKeyHex: ${wallet.publicKey === wallet.pubKeyHex}`)
    console.log(`================================================\n`)
    
    // Save user to database
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        userId: validatedData.userId,
        pubKeyHex: wallet.pubKeyHex,  // Use the correct field
        address: wallet.address
      },
      select: {
        id: true,
        email: true,
        userId: true,
        address: true,
        pubKeyHex: true,
        createdAt: true
      }
    })
    
    // Log performance metrics
    const duration = Date.now() - startTime
    console.log(`✅ User saved to database`)
    console.log(`⏱️  Total signup time: ${duration}ms`)
    console.log(`========================================\n`)
    
    // Return success response with attestation if available
    const response: any = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        userId: user.userId,
        address: user.address,
        publicKey: user.pubKeyHex
      },
      message: 'User created successfully'
    }
    
    // Add attestation quote if available
    if (wallet.attestationQuote) {
      response.attestation = {
        quote: wallet.attestationQuote,
        eventLog: wallet.eventLog,
        checksum: wallet.attestationChecksum,
        verificationUrls: {
          phala: wallet.phalaVerificationUrl,
          t16z: wallet.t16zVerificationUrl
        },
        timestamp: new Date().toISOString()
      }
      console.log(`📜 Attestation quote included in response`)
    }
    
    // Create audit log entry with full context (even though attestation only contains public key)
    await createAuditLog({
      userId: user.userId,
      operation: 'signup',
      attestationQuote: wallet.attestationQuote,
      eventLog: wallet.eventLog,
      attestationChecksum: wallet.attestationChecksum,
      phalaVerificationUrl: wallet.phalaVerificationUrl,
      t16zVerificationUrl: wallet.t16zVerificationUrl,
      applicationData: {
        email: user.email,
        namespace: process.env.APP_NAMESPACE || 'the-accountant-v1',
        timestamp: new Date().toISOString(),
        note: 'Attestation quote contains only public key (Intel TDX 64-byte limit)'
      },
      address: user.address,
      publicKey: user.pubKeyHex
    })
    
    return NextResponse.json(response, { status: 201 })
    
  } catch (error) {
    console.error('Signup error:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }
    
    // Handle database errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }
    
    // Handle TEE connection errors
    if (error instanceof Error && error.message.includes('TEE not available')) {
      return NextResponse.json(
        { error: 'Key generation service unavailable. Please try again later.' },
        { status: 503 }
      )
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Document the API endpoint
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/signup',
    method: 'POST',
    description: 'Create a new user account with deterministic wallet',
    body: {
      email: 'string (valid email)',
      userId: 'string (3-50 chars, alphanumeric with _ and -)'
    },
    responses: {
      201: 'User created successfully',
      400: 'Validation error',
      409: 'User already exists',
      503: 'TEE service unavailable',
      500: 'Internal server error'
    }
  })
}