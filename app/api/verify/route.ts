import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyMessage } from 'viem'
import { prisma } from '@/lib/db'

// Validation schema
const verifyRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature format'),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional(),
  userId: z.string().min(3).max(50).optional()
}).refine(
  data => data.address || data.userId,
  { message: 'Either address or userId must be provided' }
)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Parse and validate request body
    const body = await request.json()
    const { message, signature, address, userId } = verifyRequestSchema.parse(body)
    
    let expectedAddress = address
    let userData = null
    
    // If userId provided, look up the address
    if (userId) {
      userData = await prisma.user.findUnique({
        where: { userId },
        select: { 
          id: true,
          userId: true,
          address: true,
          pubKeyHex: true 
        }
      })
      
      if (!userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      
      expectedAddress = userData.address
    }
    
    // Verify the signature using viem
    let isValid = false
    let recoveredAddress: string | null = null
    
    try {
      // Verify and recover the address from signature
      isValid = await verifyMessage({
        address: expectedAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`
      })
      
      // For debugging, we can also recover the address
      // This helps identify who actually signed if verification fails
      if (!isValid) {
        const { recoverAddress } = await import('viem')
        const { hashMessage } = await import('viem')
        
        recoveredAddress = await recoverAddress({
          hash: hashMessage(message),
          signature: signature as `0x${string}`
        })
      }
    } catch (verifyError) {
      console.error('Signature verification error:', verifyError)
      isValid = false
    }
    
    // Log performance metrics
    const duration = Date.now() - startTime
    console.log(`Signature verification completed in ${duration}ms`)
    
    // Prepare response
    const response = {
      valid: isValid,
      message,
      expectedAddress,
      ...(userData && { 
        userId: userData.userId,
        publicKey: userData.pubKeyHex 
      }),
      ...(recoveredAddress && !isValid && { 
        recoveredAddress,
        error: 'Signature does not match expected address' 
      }),
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('Verification error:', error)
    
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
    endpoint: '/api/verify',
    method: 'POST',
    description: 'Verify an ECDSA signature against a message and address',
    body: {
      message: 'string - Original message that was signed',
      signature: 'string - Hex signature to verify (0x...)',
      address: 'string (optional) - Ethereum address to verify against',
      userId: 'string (optional) - User ID to look up address'
    },
    note: 'Either address or userId must be provided',
    response: {
      valid: 'boolean - Whether signature is valid',
      message: 'Original message',
      expectedAddress: 'Address that should have signed',
      userId: 'User ID (if provided)',
      publicKey: 'Public key (if userId provided)',
      recoveredAddress: 'Actual signer address (if verification failed)',
      timestamp: 'ISO timestamp of verification'
    },
    responses: {
      200: 'Verification completed (check valid field)',
      400: 'Validation error',
      404: 'User not found (when userId provided)',
      500: 'Internal server error'
    }
  })
}