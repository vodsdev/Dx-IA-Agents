import { Router, Request, Response } from 'express';

const router = Router();

router.post('/vixdev', (req: Request, res: Response) => {
  const { status, commit_url, diff, metadata } = req.body;
  
  console.log('📨 Webhook Vixdev reçu:', { status, commit_url });
  
  if (status === 'success') {
    console.log(`✅ Composant généré et pushé: ${commit_url}`);
  }
  
  res.json({
    success: true,
    message: 'Webhook traité',
    timestamp: new Date().toISOString(),
  });
});

router.post('/github', (req: Request, res: Response) => {
  console.log('📨 Webhook GitHub reçu:', req.body);
  
  res.json({
    success: true,
    message: 'Webhook GitHub traité',
    timestamp: new Date().toISOString(),
  });
});

export { router as webhookRoutes };