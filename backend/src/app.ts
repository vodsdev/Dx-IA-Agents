import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index';
import { errorMiddleware } from './api/middleware/error.middleware';
import { loggingMiddleware } from './api/middleware/logging.middleware';
import { agentRoutes } from './api/routes/agents.routes';
import { teamRoutes } from './api/routes/teams.routes';
import { workflowRoutes } from './api/routes/workflows.routes';
import { taskRoutes } from './api/routes/tasks.routes';
import { modelRoutes } from './api/routes/models.routes';
import { metricsRoutes } from './api/routes/metrics.routes';
import { webhookRoutes } from './api/routes/webhooks.routes';
import { adminRoutes } from './api/routes/admin.routes';
import { healthChecker } from './core/health-checker';
import { UniversalModelHub } from './core/universal-model-hub';
import { ModelRouter } from './core/model-router';
import { vectorStore } from './core/vector-store';
import { knowledgeGraph } from './core/knowledge-graph';
import { ContextWindow } from './core/context-window';
import { PromptOptimizer } from './core/prompt-optimizer';

const app = express();

// Initialize core services with dependency injection
export const universalModelHub = new UniversalModelHub();
export const modelRouter = new ModelRouter(universalModelHub);
// vectorStore is already an exported singleton
// knowledgeGraph is already an exported singleton, initialized with vectorStore
export const contextWindow = new ContextWindow(universalModelHub, modelRouter);
export const promptOptimizer = new PromptOptimizer(universalModelHub, modelRouter);

// Set model references for ModelRouter after UniversalModelHub is initialized
universalModelHub.getModels().forEach(model => modelRouter.setModelReference(model));



// Security
app.use(helmet());
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
app.use(loggingMiddleware);

// Health check
app.get('/health', async (req, res) => {
  const health = await healthChecker.checkHealth();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorMiddleware);

export { app };