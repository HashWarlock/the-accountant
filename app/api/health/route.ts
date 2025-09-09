import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isTeeAvailable } from '@/lib/dstack'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  checks: {
    database: {
      status: 'up' | 'down'
      latency?: number
      error?: string
    }
    tee: {
      status: 'up' | 'down' | 'not_required'
      available: boolean
      error?: string
    }
    memory?: {
      used: number
      total: number
      percentage: number
    }
  }
  version?: {
    node: string
    nextjs: string
    environment: string
  }
}

// Track server start time for uptime calculation
const serverStartTime = Date.now()

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  // Check if detailed info should be exposed
  const exposeDetails = process.env.EXPOSE_INFO === 'true' || process.env.NODE_ENV !== 'production'
  
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - serverStartTime) / 1000), // seconds
    checks: {
      database: { status: 'down' },
      tee: { status: 'down', available: false }
    }
  }
  
  // Check database connectivity
  try {
    const dbStart = Date.now()
    const userCount = await prisma.user.count()
    const dbLatency = Date.now() - dbStart
    
    health.checks.database = {
      status: 'up',
      latency: dbLatency
    }
    
    // Add user count if details exposed
    if (exposeDetails) {
      (health.checks.database as any).userCount = userCount
    }
  } catch (error) {
    health.status = 'degraded'
    health.checks.database = {
      status: 'down',
      error: exposeDetails ? (error instanceof Error ? error.message : 'Database connection failed') : undefined
    }
  }
  
  // Check TEE/dstack availability
  try {
    const teeAvailable = await Promise.race([
      isTeeAvailable(),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000)) // 1s timeout
    ])
    
    health.checks.tee = {
      status: teeAvailable ? 'up' : (process.env.NODE_ENV === 'production' ? 'down' : 'not_required'),
      available: teeAvailable
    }
    
    // In production, TEE being down is critical
    if (process.env.NODE_ENV === 'production' && !teeAvailable) {
      health.status = 'unhealthy'
    }
  } catch (error) {
    health.checks.tee = {
      status: process.env.NODE_ENV === 'production' ? 'down' : 'not_required',
      available: false,
      error: exposeDetails ? (error instanceof Error ? error.message : 'TEE check failed') : undefined
    }
    
    if (process.env.NODE_ENV === 'production') {
      health.status = 'unhealthy'
    }
  }
  
  // Add memory usage if details exposed
  if (exposeDetails) {
    const memUsage = process.memoryUsage()
    health.checks.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    }
    
    // Add version information
    health.version = {
      node: process.version,
      nextjs: require('next/package.json').version,
      environment: process.env.NODE_ENV || 'development'
    }
  }
  
  // Determine overall health status
  if (health.checks.database.status === 'down') {
    health.status = 'unhealthy'
  }
  
  // Log health check
  const duration = Date.now() - startTime
  console.log(`Health check completed in ${duration}ms - Status: ${health.status}`)
  
  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503
  
  return NextResponse.json(health, { status: statusCode })
}

// Document the API endpoint
export async function POST() {
  return NextResponse.json({
    endpoint: '/api/health',
    method: 'GET',
    description: 'Application health check endpoint',
    response: {
      status: 'Overall health status (healthy/degraded/unhealthy)',
      timestamp: 'ISO timestamp of health check',
      uptime: 'Server uptime in seconds',
      checks: {
        database: 'Database connection status and latency',
        tee: 'TEE/dstack availability status',
        memory: 'Memory usage statistics (if EXPOSE_INFO=true)'
      },
      version: 'Version information (if EXPOSE_INFO=true)'
    },
    environment: {
      EXPOSE_INFO: 'Set to "true" to expose detailed health metrics'
    },
    responses: {
      200: 'Service is healthy or degraded but operational',
      503: 'Service is unhealthy'
    }
  })
}