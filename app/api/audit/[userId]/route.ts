import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserAuditLogs, getAuditStats } from '@/lib/audit'

const paramsSchema = z.object({
  userId: z.string().min(3).max(50)
})

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
  operation: z.enum(['signup', 'sign', 'verify', 'key-access']).optional(),
  stats: z.coerce.boolean().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const resolvedParams = await params
    
    // Validate userId parameter
    const { userId } = paramsSchema.parse(resolvedParams)
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const query = querySchema.parse({
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      operation: searchParams.get('operation') || undefined,
      stats: searchParams.get('stats') || undefined
    })
    
    // If stats requested, return statistics
    if (query.stats) {
      const stats = await getAuditStats(userId)
      return NextResponse.json({
        userId,
        stats
      })
    }
    
    // Get audit logs for the user
    const logs = await getUserAuditLogs(userId, {
      limit: query.limit,
      offset: query.offset,
      operation: query.operation
    })
    
    // Parse applicationData for each log
    const logsWithParsedData = logs.map(log => ({
      ...log,
      applicationData: log.applicationData ? JSON.parse(log.applicationData) : null
    }))
    
    return NextResponse.json({
      userId,
      logs: logsWithParsedData,
      count: logsWithParsedData.length,
      limit: query.limit,
      offset: query.offset
    })
    
  } catch (error) {
    console.error('Audit log retrieval error:', error)
    
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
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}