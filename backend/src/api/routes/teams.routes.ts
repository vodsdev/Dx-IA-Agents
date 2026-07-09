import { Router } from 'express';
import { teamsController } from '../controllers/teams.controller';

const router = Router();

router.get('/', teamsController.getAll);
router.get('/:id', teamsController.getById);
router.post('/', teamsController.create);
router.delete('/:id', teamsController.dissolve);

export { router as teamRoutes };