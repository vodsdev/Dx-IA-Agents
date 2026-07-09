import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config/index';
import { socketHandlers } from './socket-handlers';

export class SocketServer {
  private io: SocketIOServer | null = null;
  private static instance: SocketServer;
  
  static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer();
    }
    return SocketServer.instance;
  }
  
  initialize(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.server.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });
    
    this.io.on('connection', (socket) => {
      console.log(`🟢 Client connecté: ${socket.id}`);
      
      socketHandlers.register(socket, this.io!);
      
      socket.on('disconnect', (reason) => {
        console.log(`🔴 Client déconnecté: ${socket.id} (${reason})`);
      });
    });
    
    console.log('📡 Serveur WebSocket initialisé');
    return this.io;
  }
  
  getIO(): SocketIOServer | null {
    return this.io;
  }
  
  emitToRoom(room: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }
  
  emitToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export const socketServer = SocketServer.getInstance();