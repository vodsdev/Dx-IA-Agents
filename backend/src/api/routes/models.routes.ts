import { Router } from 'express';
import { modelsController } from '../controllers/models.controller';

const router = Router();

router.get('/providers', modelsController.getProviders);
router.post('/request', modelsController.request);
router.post('/bridge', modelsController.createBridge);
router.post('/fused-request', modelsController.fusedRequest);
router.get('/bridges', modelsController.getBridges);

export { router as modelRoutes };