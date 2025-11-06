import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { wechatRouter } from './routes/wechat.js';
import { chatbotRouter } from './routes/chatbot.js';
import { securityHeaders, corsConfig, rateLimiter } from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { getAllArticles } from './services/dataServices.js';
import { buildKnowledgeBase } from './services/vectorService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// API prefix - unique to avoid conflicts with yoda-app (/api/v1/)
const API_PREFIX = '/api/chat';

// Security middleware (applied to all routes)
app.use(securityHeaders);
app.use(corsConfig);

// Rate limiting for API endpoints
app.use(`${API_PREFIX}`, rateLimiter(100, 60000)); // 100 requests per minute

// Middleware for WeChat (raw XML text) - accept both application/xml and text/xml
app.use(`${API_PREFIX}/wx`, express.text({ 
  type: ['application/xml', 'text/xml', 'text/plain'], 
  limit: '1mb' 
}));

// Middleware for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use(`${API_PREFIX}/wx`, wechatRouter);
app.use(`${API_PREFIX}/chatbot`, chatbotRouter);

// Production-ready health check endpoint
app.get(`${API_PREFIX}/health`, (req: Request, res: Response) => {
  const healthData = {
    status: 'healthy',
    service: 'yoda-chat',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      api: 'ok',
      wechat: process.env.WECHAT_TOKEN ? 'configured' : 'not_configured',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
    }
  };
  res.status(200).json(healthData);
});

// Simple health check for basic monitoring (kept for compatibility)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Root endpoint - shows available endpoints
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'yoda-chat',
    version: process.env.npm_package_version || '1.0.0',
    description: 'AI Chatbot Service for WeChat Integration',
    endpoints: {
      health: `${API_PREFIX}/health`,
      wechat: `${API_PREFIX}/wx`,
      chatbot: `${API_PREFIX}/chatbot`
    }
  });
});

// 404 handler - must be before error handler
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Yoda Chat server is running on port ${PORT}`);
  console.log(`📡 WeChat endpoint: http://localhost:${PORT}${API_PREFIX}/wx`);
  console.log(`📡 Chatbot endpoint: http://localhost:${PORT}${API_PREFIX}/chatbot`);
  console.log(`🏥 Health check: http://localhost:${PORT}${API_PREFIX}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

(async () => {
  const articles = await getAllArticles();

  // await buildKnowledgeBase(articles);
})();

// Graceful shutdown
const gracefulShutdown = (signal: string): void => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
