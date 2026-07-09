import { Request, Response } from 'express';
import { teamManager } from '../../teams/team-manager';

export class TeamsController {
  async getAll(req: Request, res: Response): Promise<void> {
    const teams = Array.from(teamManager.getAllTeams());
    
    res.json({
      success: true,
      data: teams.map(t => ({
        id: t.id,
        name: t.name,
        memberCount: t.members.length,
        currentLoad: t.currentLoad,
        status: t.status,
        performance: t.performance,
      })),
      count: teams.length,
      timestamp: new Date().toISOString(),
    });
  }
  
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const team = teamManager.getTeam(id);
    
    if (!team) {
      res.status(404).json({ success: false, error: 'Équipe non trouvée' });
      return;
    }
    
    res.json({
      success: true,
      data: team,
      timestamp: new Date().toISOString(),
    });
  }
  
  async create(req: Request, res: Response): Promise<void> {
    const { name, type, specialization } = req.body;
    
    const team = await teamManager.createTeam({
      name,
      type: type || 'general',
      specialization: specialization || 'general',
    });
    
    res.status(201).json({
      success: true,
      data: team,
      timestamp: new Date().toISOString(),
    });
  }
  
  async dissolve(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    await teamManager.dissolveTeam(id);
    
    res.json({
      success: true,
      message: 'Équipe dissoute avec succès',
      timestamp: new Date().toISOString(),
    });
  }
}

export const teamsController = new TeamsController();