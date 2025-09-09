import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

// Query parameter validation schema
const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  sort: z.enum(['createdAt', 'email', 'userId', 'address']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
}).partial()

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const query = querySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sort: searchParams.get('sort') || 'createdAt',
      order: searchParams.get('order') || 'desc',
      search: searchParams.get('search') || undefined
    })
    
    // Ensure reasonable limits
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 10))
    const skip = (page - 1) * limit
    
    // Build where clause for search
    const where = query.search ? {
      OR: [
        { email: { contains: query.search } },
        { userId: { contains: query.search } },
        { address: { contains: query.search } }
      ]
    } : {}
    
    // Execute queries in parallel for performance
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [query.sort || 'createdAt']: query.order || 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          userId: true,
          pubKeyHex: true,
          address: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ])
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1
    
    // Log performance metrics
    const duration = Date.now() - startTime
    console.log(`Admin users query completed in ${duration}ms - Retrieved ${users.length} users (page ${page}/${totalPages})`)
    
    // Check performance target (200ms p95)
    if (duration > 200) {
      console.warn(`⚠️  Admin users query took ${duration}ms, exceeding 200ms target`)
    }
    
    // Add cache headers for better performance
    const headers = new Headers()
    headers.set('Cache-Control', 'private, max-age=10') // Cache for 10 seconds
    headers.set('X-Total-Count', totalCount.toString())
    headers.set('X-Page', page.toString())
    headers.set('X-Limit', limit.toString())
    headers.set('X-Total-Pages', totalPages.toString())
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage
      },
      query: {
        sort: query.sort,
        order: query.order,
        search: query.search
      }
    }, { 
      status: 200,
      headers 
    })
    
  } catch (error) {
    console.error('Admin users error:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }
    
    // Database connection error
    if (error instanceof Error && error.message.includes('P2021')) {
      return NextResponse.json(
        { error: 'Database connection failed' },
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
export async function POST() {
  return NextResponse.json({
    endpoint: '/api/admin/users',
    method: 'GET',
    description: 'Admin endpoint to list all users with pagination and search',
    queryParameters: {
      page: 'number (default: 1) - Page number',
      limit: 'number (default: 10, max: 100) - Items per page',
      sort: 'string (createdAt|email|userId|address) - Sort field',
      order: 'string (asc|desc) - Sort order',
      search: 'string (optional) - Search in email, userId, or address'
    },
    response: {
      users: 'Array of user objects with public fields',
      pagination: {
        page: 'Current page number',
        limit: 'Items per page',
        totalCount: 'Total number of users',
        totalPages: 'Total number of pages',
        hasNextPage: 'Boolean indicating if next page exists',
        hasPreviousPage: 'Boolean indicating if previous page exists'
      },
      query: 'Echo of query parameters used'
    },
    headers: {
      'X-Total-Count': 'Total number of users',
      'X-Page': 'Current page',
      'X-Limit': 'Items per page',
      'X-Total-Pages': 'Total pages'
    },
    responses: {
      200: 'Users retrieved successfully',
      400: 'Invalid query parameters',
      503: 'Database unavailable',
      500: 'Internal server error'
    }
  })
}