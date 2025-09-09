import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createWallet } from '@/lib/wallet'

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
    
    // Generate deterministic wallet using dstack
    console.log(`Creating wallet for user: ${validatedData.userId}`)
    const wallet = await createWallet(validatedData.userId)
    
    // Save user to database
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        userId: validatedData.userId,
        pubKeyHex: wallet.publicKey,
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
    console.log(`Signup completed for ${validatedData.userId} in ${duration}ms`)
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          userId: user.userId,
          address: user.address,
          publicKey: user.pubKeyHex
        },
        message: 'User created successfully'
      },
      { status: 201 }
    )
    
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