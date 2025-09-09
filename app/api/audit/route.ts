import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAllAuditLogs, getAuditStats } from '@/lib/audit'

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(500).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0),
  operation: z.enum(['signup', 'sign', 'verify', 'key-access']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  stats: z.coerce.boolean().optional()
})

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const query = querySchema.parse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      operation: searchParams.get('operation'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      stats: searchParams.get('stats')
    })
    
    // If stats requested, return overall statistics
    if (query.stats) {
      const stats = await getAuditStats()
      return NextResponse.json({
        stats,
        timestamp: new Date().toISOString()
      })
    }
    
    // Get all audit logs with filters
    const logs = await getAllAuditLogs({
      limit: query.limit,
      offset: query.offset,
      operation: query.operation,
      startDate: query.startDate,
      endDate: query.endDate
    })
    
    // Parse applicationData for each log
    const logsWithParsedData = logs.map(log => ({
      ...log,
      applicationData: log.applicationData ? JSON.parse(log.applicationData) : null
    }))
    
    return NextResponse.json({
      logs: logsWithParsedData,
      count: logsWithParsedData.length,
      limit: query.limit,
      offset: query.offset,
      filters: {
        operation: query.operation,
        startDate: query.startDate,
        endDate: query.endDate
      }
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