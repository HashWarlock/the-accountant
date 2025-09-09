import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createWallet } from '@/lib/wallet'

// Validation schemas
const paramsSchema = z.object({
  userId: z.string().min(3).max(50)
})

const signRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long')
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const startTime = Date.now()
  
  try {
    // Await params (Next.js 15 requirement)
    const resolvedParams = await params
    
    // Validate userId parameter
    const validatedParams = paramsSchema.parse(resolvedParams)
    
    // Parse and validate request body
    const body = await request.json()
    const { message } = signRequestSchema.parse(body)
    
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { userId: validatedParams.userId },
      select: { 
        id: true, 
        userId: true, 
        address: true,
        pubKeyHex: true 
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Re-derive wallet for signing (using dstack)
    console.log(`Signing message for user: ${user.userId}`)
    const wallet = await createWallet(user.userId)
    
    // Verify the address matches (consistency check)
    if (wallet.address !== user.address) {
      console.error(`Address mismatch for ${user.userId}: DB=${user.address}, Derived=${wallet.address}`)
      return NextResponse.json(
        { error: 'Key derivation inconsistency' },
        { status: 500 }
      )
    }
    
    // Sign the message
    const signature = await wallet.signMessage(message)
    
    // Clear sensitive data from memory (wallet object will be garbage collected)
    const responseData = {
      signature,
      address: user.address,
      publicKey: user.pubKeyHex,
      message,
      timestamp: new Date().toISOString()
    }
    
    // Log performance metrics
    const duration = Date.now() - startTime
    console.log(`Message signed for ${user.userId} in ${duration}ms`)
    
    // Check performance target (50ms p95)
    if (duration > 50) {
      console.warn(`⚠️  Signing took ${duration}ms, exceeding 50ms target`)
    }
    
    return NextResponse.json(responseData, { status: 200 })
    
  } catch (error) {
    console.error('Signing error:', error)
    
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
    
    // Handle TEE connection errors
    if (error instanceof Error && error.message.includes('TEE not available')) {
      return NextResponse.json(
        { error: 'Signing service unavailable. Please try again later.' },
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
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const resolvedParams = await params
  return NextResponse.json({
    endpoint: `/api/users/${resolvedParams.userId}/sign`,
    method: 'POST',
    description: 'Sign a message with user\'s deterministic private key',
    parameters: {
      userId: 'Path parameter - User ID (3-50 characters)'
    },
    body: {
      message: 'string (1-10000 characters) - Message to sign'
    },
    response: {
      signature: 'Hex string - ECDSA signature',
      address: 'Ethereum address of the signer',
      publicKey: 'Public key of the signer',
      message: 'Original message that was signed',
      timestamp: 'ISO timestamp of signing'
    },
    responses: {
      200: 'Message signed successfully',
      400: 'Validation error',
      404: 'User not found',
      503: 'TEE service unavailable',
      500: 'Internal server error'
    }
  })
}