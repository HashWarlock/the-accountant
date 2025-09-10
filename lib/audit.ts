import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export interface AuditLogData {
  userId: string
  operation: 'signup' | 'sign' | 'verify' | 'key-access'
  attestationQuote?: string
  eventLog?: string
  applicationData?: any
  address?: string
  publicKey?: string
  message?: string
  signature?: string
  attestationChecksum?: string
  phalaVerificationUrl?: string
  t16zVerificationUrl?: string
}

/**
 * Create an audit log entry for a key operation
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: data.userId,
        operation: data.operation,
        attestationQuote: data.attestationQuote || null,
        eventLog: data.eventLog || null,
        applicationData: data.applicationData ? JSON.stringify(data.applicationData) : null,
        address: data.address || null,
        publicKey: data.publicKey || null,
        message: data.message || null,
        signature: data.signature || null,
        attestationChecksum: data.attestationChecksum || null,
        phalaVerificationUrl: data.phalaVerificationUrl || null,
        t16zVerificationUrl: data.t16zVerificationUrl || null,
        verificationStatus: data.attestationChecksum ? 'pending' : null,
        quoteUploadedAt: data.attestationChecksum ? new Date() : null
      }
    })
    
    console.log(`📝 Audit log created: ${auditLog.id} for ${data.operation} by ${data.userId}`)
    return auditLog
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging should not break the main operation
    return null
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  options?: {
    limit?: number
    offset?: number
    operation?: string
  }
) {
  const where: Prisma.AuditLogWhereInput = { userId }
  
  if (options?.operation) {
    where.operation = options.operation
  }
  
  return await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
    select: {
      id: true,
      operation: true,
      createdAt: true,
      address: true,
      publicKey: true,
      message: true,
      signature: true,
      attestationQuote: true,
      eventLog: true,
      applicationData: true
    }
  })
}

/**
 * Get all audit logs (admin function)
 */
export async function getAllAuditLogs(options?: {
  limit?: number
  offset?: number
  operation?: string
  startDate?: Date
  endDate?: Date
}) {
  const where: Prisma.AuditLogWhereInput = {}
  
  if (options?.operation) {
    where.operation = options.operation
  }
  
  if (options?.startDate || options?.endDate) {
    where.createdAt = {}
    if (options.startDate) {
      where.createdAt.gte = options.startDate
    }
    if (options.endDate) {
      where.createdAt.lte = options.endDate
    }
  }
  
  return await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 100,
    skip: options?.offset || 0,
    include: {
      user: {
        select: {
          email: true,
          userId: true
        }
      }
    }
  })
}

/**
 * Get audit log statistics
 */
export async function getAuditStats(userId?: string) {
  const where: Prisma.AuditLogWhereInput = userId ? { userId } : {}
  
  const [total, byOperation, withAttestation] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({
      by: ['operation'],
      where,
      _count: true
    }),
    prisma.auditLog.count({
      where: {
        ...where,
        attestationQuote: { not: null }
      }
    })
  ])
  
  return {
    total,
    byOperation: byOperation.reduce((acc, item) => {
      acc[item.operation] = item._count
      return acc
    }, {} as Record<string, number>),
    withAttestation,
    attestationRate: total > 0 ? (withAttestation / total) * 100 : 0
  }
}