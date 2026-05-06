import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import authRoutes from './modules/auth/auth.routes';
import propertyRoutes from './modules/property/property.routes';
import leadRoutes from './modules/lead/lead.routes';
import showingRoutes from './modules/showing/showing.routes';
import neighborhoodRoutes from './modules/neighborhood/neighborhood.routes';
import marketRoutes from './modules/market/market.routes';
import toolsRoutes from './modules/tools/tools.routes';
import agentRoutes from './modules/agent/agent.routes';

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const apiPrefix = process.env.API_PREFIX || '/api/v1';

// Auth routes
app.use(`${apiPrefix}/auth`, authRoutes);

// Property routes
app.use(`${apiPrefix}/properties`, propertyRoutes);

// Lead routes
app.use(`${apiPrefix}/leads`, leadRoutes);

// Showing routes
app.use(`${apiPrefix}/showings`, showingRoutes);

// Neighborhood routes
app.use(`${apiPrefix}/neighborhoods`, neighborhoodRoutes);

// Market routes
app.use(`${apiPrefix}/market`, marketRoutes);

// Tools routes (mortgage calculator, etc.)
app.use(`${apiPrefix}/tools`, toolsRoutes);

// Agent routes
app.use(`${apiPrefix}/agents`, agentRoutes);

// Dashboard routes (reusing agent controller)
app.use(`${apiPrefix}/dashboard`, agentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
