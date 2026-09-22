import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error';
import { requestLoggerMiddleware } from './utils/logger';
import { securityMiddleware } from './middleware/securityMiddleware';
import { standardApiLimiter } from './middleware/rateLimiter';

export const createApp = (): Application => {
  const app = express();

  // 1. Structured Logging & Request Correlation ID
  app.use(requestLoggerMiddleware);

  // 2. CORS & Body Parsers
  app.use(cors({
    origin: '*',
    credentials: true
  }));
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // 3. Security Input Sanitization (XSS & script tag neutralization)
  app.use(securityMiddleware.sanitizeInput);

  // 4. Rate Limiting Protection on API endpoints
  app.use('/api', standardApiLimiter);

  // Health check endpoints
  const healthHandler = (_req: express.Request, res: express.Response) => {
    res.json({
      status: 'HEALTHY',
      service: 'MediFlow AI Backend Core',
      timestamp: new Date().toISOString()
    });
  };

  app.get('/', (_req, res) => {
    res.json({
      service: 'MediFlow AI Backend Core Gateway',
      status: 'HEALTHY',
      health: 'http://127.0.0.1:5000/health',
      frontend_ui: 'http://127.0.0.1:5173',
      ai_service: 'http://127.0.0.1:8000'
    });
  });

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // REST API Routes
  app.use('/api', routes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
