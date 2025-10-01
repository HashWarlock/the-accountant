import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db.js';

const router = Router();

// Validation schemas
const userQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
  search: z.string().optional(),
});

/**
 * GET /admin/users - Get all users (with pagination and search)
 */
router.get('/users', async (req, res) => {
  try {
    const { limit, offset, search } = userQuerySchema.parse(req.query);

    const where: any = {};
    if (search) {
      where.OR = [
        { userId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          userId: true,
          email: true,
          address: true,
          pubKeyHex: true,
          createdAt: true,
          _count: {
            select: { auditLogs: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    console.log(`✅ [Admin] Retrieved ${users.length} users`);

    return res.status(200).json({
      users: users.map(user => ({
        ...user,
        auditLogCount: user._count.auditLogs
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);

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
 * GET /admin/users/:userId - Get specific user details
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            operation: true,
            createdAt: true,
            verificationStatus: true
          }
        },
        _count: {
          select: { auditLogs: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ [Admin] Retrieved user details: ${userId}`);

    return res.status(200).json({
      user: {
        ...user,
        recentAuditLogs: user.auditLogs,
        totalAuditLogs: user._count.auditLogs
      }
    });
  } catch (error) {
    console.error('Admin user details error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /admin/stats - Get platform statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalAuditLogs,
      recentSignups,
      recentSigns
    ] = await Promise.all([
      prisma.user.count(),
      prisma.auditLog.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.auditLog.count({
        where: {
          operation: 'sign',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    console.log(`✅ [Admin] Retrieved platform statistics`);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalAuditLogs,
        recentSignups,
        recentSigns,
        averageLogsPerUser: totalUsers > 0 ? (totalAuditLogs / totalUsers).toFixed(2) : 0
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
