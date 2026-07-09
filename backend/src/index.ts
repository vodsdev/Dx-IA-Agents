import 'dotenv/config';
import { app } from './app';
import { config } from './config/index';
import { agentManager } from './core/agent-manager';
import { universalModelHub } from './core/universal-model-hub';
import { memoryManager } from './core/memory-manager';
import { scheduler } from './core/scheduler';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

async function bootstrap(): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀  DX-AGENTS  v2.0.0                                     ║
║   Plateforme d'Intelligence Artificielle Distribuée         ║
║   2000 Agents • Multi-Modèles • Swarm Intelligence         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
  
  const httpServer = createServer(app);
  
  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.server.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });
  
  // Initialize core systems
  console.log('🔧 Initialisation des systèmes core...');
  
  memoryManager.initialize();
  
  await agentManager.initializeAgentPool();
  
  console.log('✅ Tous les systèmes sont initialisés');
  
  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log(`🟢 Client connecté: ${socket.id}`);
    
    socket.on('subscribe:agents', () => {
      socket.join('agents');
    });
    
    socket.on('subscribe:teams', () => {
      socket.join('teams');
    });
    
    socket.on('subscribe:workflows', () => {
      socket.join('workflows');
    });
    
    // Send agent stats every 5 seconds
    const statsInterval = setInterval(() => {
      const agentCount = agentManager.getAgentCount();
      const modelMetrics = universalModelHub.getMetrics();
      
      socket.emit('stats:update', {
        agents: agentCount,
        models: modelMetrics,
        timestamp: new Date().toISOString(),
      });
    }, 5000);
    
    socket.on('disconnect', () => {
      console.log(`🔴 Client déconnecté: ${socket.id}`);
      clearInterval(statsInterval);
    });
  });
  
  // Schedule periodic tasks
  scheduler.scheduleTask({
    id: 'health-check',
    name: 'System Health Check',
    cronExpression: '*/1 * * * *',
    handler: async () => {
      const agentCount = agentManager.getAgentCount();
      const metrics = universalModelHub.getMetrics();
      io.emit('health:update', {
        agents: agentCount.total,
        models: Object.keys(metrics).length,
        timestamp: new Date().toISOString(),
      });
    },
    enabled: true,
  });
  
  // Start server
  httpServer.listen(config.server.port, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🌐  Serveur DX-Agents démarré sur le port ${config.server.port}          ║
║   📡  WebSocket disponible sur ws://localhost:${config.server.port}      ║
║   🔗  API REST: http://localhost:${config.server.port}/api           ║
║   📊  Health: http://localhost:${config.server.port}/health          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
  });
  
  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Arrêt du serveur...');
    scheduler.cleanup();
    memoryManager.cleanup();
    await agentManager.cleanup();
    process.exit(0);
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch(console.error);