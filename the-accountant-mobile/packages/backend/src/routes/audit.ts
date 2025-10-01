import { Router } from 'express';
import { z } from 'zod';
import { authenticateSession, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/db.js';

const router = Router();

// Validation schemas
const auditQuerySchema = z.object({
  operation: z.enum(['signup', 'sign', 'verify']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

/**
 * GET /audit/logs - Get audit logs for authenticated user
 */
router.get('/logs', authenticateSession, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { operation, limit, offset } = auditQuerySchema.parse(req.query);

    const where: any = { userId };
    if (operation) {
      where.operation = operation;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          userId: true,
          operation: true,
          address: true,
          publicKey: true,
          message: true,
          signature: true,
          attestationChecksum: true,
          phalaVerificationUrl: true,
          t16zVerificationUrl: true,
          verificationStatus: true,
          createdAt: true,
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    console.log(`✅ [Audit] Retrieved ${logs.length} logs for user: ${userId}`);

    return res.status(200).json({
      logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Audit logs error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /audit/logs/:logId - Get specific audit log entry
 */
router.get('/logs/:logId', authenticateSession, async (req: AuthRequest, res) => {
  try {
    const { logId } = req.params;
    const userId = req.user!.userId;

    const log = await prisma.auditLog.findFirst({
      where: {
        id: logId,
        userId // Ensure user can only access their own logs
      },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            address: true
          }
        }
      }
    });

    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    console.log(`✅ [Audit] Retrieved log entry: ${logId}`);

    return res.status(200).json({ log });
  } catch (error) {
    console.error('Audit log retrieval error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /audit/export - Export audit logs (JSON or CSV)
 */
router.get('/export', authenticateSession, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const format = req.query.format === 'csv' ? 'csv' : 'json';

    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        operation: true,
        address: true,
        publicKey: true,
        message: true,
        signature: true,
        attestationChecksum: true,
        t16zVerificationUrl: true,
        verificationStatus: true,
        createdAt: true,
      }
    });

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'ID', 'User ID', 'Operation', 'Address', 'Public Key',
        'Message', 'Signature', 'Attestation Checksum',
        'Verification URL', 'Status', 'Created At'
      ];

      const rows = logs.map(log => [
        log.id,
        log.userId,
        log.operation,
        log.address || '',
        log.publicKey || '',
        log.message || '',
        log.signature || '',
        log.attestationChecksum || '',
        log.t16zVerificationUrl || '',
        log.verificationStatus,
        log.createdAt.toISOString()
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${userId}-${Date.now()}.csv"`);
      return res.send(csv);
    } else {
      // Return JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${userId}-${Date.now()}.json"`);
      return res.json({
        userId,
        exportedAt: new Date().toISOString(),
        totalLogs: logs.length,
        logs
      });
    }
  } catch (error) {
    console.error('Audit export error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
