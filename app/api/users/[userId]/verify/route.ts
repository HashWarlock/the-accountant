import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { verifyMessage } from 'viem'
import { createAuditLog } from '@/lib/audit'

// Validation schemas
const paramsSchema = z.object({
  userId: z.string().min(3).max(50)
})

const verifyRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature format')
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
    const { message, signature } = verifyRequestSchema.parse(body)
    
    // Get user from database
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
    
    console.log(`\n🔍 ========== SIGNATURE VERIFICATION STARTED ==========`)
    console.log(`👤 User ID: ${user.userId}`)
    console.log(`📍 Expected Address: ${user.address}`)
    console.log(`📝 Message: "${message}"`)
    console.log(`🖊️  Signature: ${signature}`)
    
    // Verify the signature
    const isValid = await verifyMessage({
      address: user.address as `0x${string}`,
      message,
      signature: signature as `0x${string}`
    })
    
    console.log(`\n${isValid ? '✅' : '❌'} ========== VERIFICATION ${isValid ? 'SUCCESSFUL' : 'FAILED'} ==========`)
    console.log(`Result: ${isValid}`)
    console.log(`================================================\n`)
    
    // Create audit log entry for verification
    await createAuditLog({
      userId: user.userId,
      operation: 'verify',
      applicationData: {
        isValid,
        namespace: process.env.APP_NAMESPACE || 'the-accountant-v1',
        timestamp: new Date().toISOString()
      },
      address: user.address,
      publicKey: user.pubKeyHex,
      message: message,
      signature: signature
    })
    
    // Log performance metrics
    const duration = Date.now() - startTime
    console.log(`⏱️  Verification completed in ${duration}ms`)
    
    return NextResponse.json({
      valid: isValid,
      address: user.address,
      publicKey: user.pubKeyHex,
      message,
      signature,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
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
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const resolvedParams = await params
  return NextResponse.json({
    endpoint: `/api/users/${resolvedParams.userId}/verify`,
    method: 'POST',
    description: 'Verify a signature against user\'s public key',
    parameters: {
      userId: 'Path parameter - User ID (3-50 characters)'
    },
    body: {
      message: 'string (1-10000 characters) - Original message that was signed',
      signature: 'string - Hex-encoded signature to verify'
    },
    response: {
      valid: 'boolean - Whether the signature is valid',
      address: 'Ethereum address of the expected signer',
      publicKey: 'Public key of the expected signer',
      message: 'Original message',
      signature: 'Signature that was verified',
      timestamp: 'ISO timestamp of verification'
    },
    responses: {
      200: 'Verification completed',
      400: 'Validation error',
      404: 'User not found',
      500: 'Internal server error'
    }
  })
}