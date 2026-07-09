import { config } from '../config/index';

// Simulation de connexion DB - À remplacer par un vrai client PostgreSQL
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connected: boolean = false;
  
  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
  
  async connect(): Promise<void> {
    console.log(`🗄️ Connexion à la base de données: ${config.database.host}:${config.database.port}/${config.database.name}`);
    
    // Simulation
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connected = true;
    
    console.log('✅ Base de données connectée');
  }
  
  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('🔌 Base de données déconnectée');
  }
  
  isConnected(): boolean {
    return this.connected;
  }
  
  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.connected) {
      throw new Error('Base de données non connectée');
    }
    
    // Simulation
    return { rows: [], rowCount: 0 };
  }
}

export const db = DatabaseConnection.getInstance();