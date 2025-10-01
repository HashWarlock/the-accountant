import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import walletRoutes from './routes/wallet.js';
import auditRoutes from './routes/audit.js';
import adminRoutes from './routes/admin.js';
import passkeyRoutes from './routes/passkey.js';
import { prisma } from './lib/db.js';
import { isTeeAvailable, getTeeInfo } from './lib/dstack.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const teeAvailable = await isTeeAvailable();
    let teeInfo = null;

    if (teeAvailable) {
      try {
        teeInfo = await getTeeInfo();
      } catch (error) {
        console.error('Failed to get TEE info:', error);
      }
    }

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      tee: {
        available: teeAvailable,
        info: process.env.EXPOSE_INFO === 'true' ? teeInfo : undefined
      },
      database: {
        connected: true
      },
      environment: process.env.NODE_ENV || 'development',
      appNamespace: process.env.APP_NAMESPACE || 'the-accountant-mobile'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/passkey', passkeyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'POST /api/auth/session',
      'POST /api/auth/refresh',
      'POST /api/wallet/signup',
      'POST /api/wallet/sign',
      'POST /api/wallet/verify',
      'GET /api/wallet/keys',
      'GET /api/audit/logs',
      'GET /api/audit/export',
      'GET /api/admin/users',
      'GET /api/admin/stats',
      'GET /health'
    ]
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 ========== THE ACCOUNTANT MOBILE API ==========`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 APP Namespace: ${process.env.APP_NAMESPACE || 'the-accountant-mobile'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`================================================\n`);

  // Check TEE availability on startup
  isTeeAvailable().then(available => {
    if (available) {
      console.log(`✅ TEE is available and ready`);
    } else {
      console.warn(`⚠️  TEE not available - using development fallback`);
    }
  });
});

export default app;
