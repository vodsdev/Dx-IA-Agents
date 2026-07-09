import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    message: 'Task routes - À implémenter',
    timestamp: new Date().toISOString(),
  });
});

router.get('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { id: req.params.id },
    timestamp: new Date().toISOString(),
  });
});

export { router as taskRoutes };