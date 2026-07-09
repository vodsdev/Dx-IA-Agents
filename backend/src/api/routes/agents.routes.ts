import { Router } from 'express';
import { agentsController } from '../controllers/agents.controller';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';

const router = Router();

router.get('/', rateLimitMiddleware(500), agentsController.getAll);
router.get('/available', agentsController.getAvailable);
router.get('/:id', agentsController.getById);
router.post('/', agentsController.create);
router.patch('/:id/status', agentsController.updateStatus);

export { router as agentRoutes };