import { Router } from 'express';
import { metricsController } from '../controllers/metrics.controller';

const router = Router();

router.get('/', metricsController.getMetrics);
router.get('/health', metricsController.getHealth);
router.get('/system', metricsController.getSystemInfo);

export { router as metricsRoutes };