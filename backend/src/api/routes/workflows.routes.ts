import { Router } from 'express';
import { workflowsController } from '../controllers/workflows.controller';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const createWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  steps: z.array(z.object({
    name: z.string(),
    type: z.string(),
    requiredCapabilities: z.array(z.string()),
    priority: z.number().min(0).max(3).default(2),
  })),
});

router.get('/', workflowsController.getAll);
router.get('/:id', workflowsController.getById);
router.post('/', validateBody(createWorkflowSchema), workflowsController.create);
router.post('/:id/execute', workflowsController.execute);
router.post('/:id/cancel', workflowsController.cancel);

export { router as workflowRoutes };