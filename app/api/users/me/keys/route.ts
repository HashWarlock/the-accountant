import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

// Header validation schema
const headersSchema = z.object({
  'x-user-id': z.string().min(3).max(50).nullable(),
  'x-user-email': z.string().email().nullable()
}).refine(
  data => data['x-user-id'] || data['x-user-email'],
  { message: 'Either x-user-id or x-user-email header must be provided' }
)

export async function GET(request: NextRequest) {
  try {
    // Extract and validate headers
    const headers = {
      'x-user-id': request.headers.get('x-user-id'),
      'x-user-email': request.headers.get('x-user-email')
    }
    
    const validatedHeaders = headersSchema.parse(headers)
    
    // Build query based on provided header
    const whereClause = validatedHeaders['x-user-id'] 
      ? { userId: validatedHeaders['x-user-id'] }
      : { email: validatedHeaders['x-user-email'] || undefined }
    
    // Fetch user from database
    const user = await prisma.user.findFirst({
      where: whereClause,
      select: {
        id: true,
        email: true,
        userId: true,
        address: true,
        pubKeyHex: true,
        createdAt: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Return user's wallet information
    return NextResponse.json({
      userId: user.userId,
      email: user.email,
      wallet: {
        address: user.address,
        publicKey: user.pubKeyHex
      },
      createdAt: user.createdAt
    }, { status: 200 })
    
  } catch (error) {
    console.error('Get keys error:', error)
    
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
export async function POST() {
  return NextResponse.json({
    endpoint: '/api/users/me/keys',
    method: 'GET',
    description: 'Retrieve user\'s wallet information (address and public key)',
    headers: {
      'x-user-id': 'string (optional) - User ID',
      'x-user-email': 'string (optional) - User email'
    },
    note: 'Either x-user-id or x-user-email header must be provided',
    response: {
      userId: 'User ID',
      email: 'User email',
      wallet: {
        address: 'Ethereum address',
        publicKey: 'Uncompressed public key (hex)'
      },
      createdAt: 'ISO timestamp of account creation'
    },
    responses: {
      200: 'User wallet information retrieved',
      400: 'Validation error or missing headers',
      404: 'User not found',
      500: 'Internal server error'
    }
  })
}