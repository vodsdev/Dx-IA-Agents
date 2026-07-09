import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Agents
  getAgents: () => api.get('/agents'),
  getAgent: (id: string) => api.get(`/agents/${id}`),
  createAgent: (data: any) => api.post('/agents', data),
  updateAgentStatus: (id: string, status: string) => api.patch(`/agents/${id}/status`, { status }),
  getAvailableAgents: (type?: string) => api.get('/agents/available', { params: { type } }),
  
  // Teams
  getTeams: () => api.get('/teams'),
  getTeam: (id: string) => api.get(`/teams/${id}`),
  createTeam: (data: any) => api.post('/teams', data),
  dissolveTeam: (id: string) => api.delete(`/teams/${id}`),
  
  // Workflows
  getWorkflows: () => api.get('/workflows'),
  getWorkflow: (id: string) => api.get(`/workflows/${id}`),
  createWorkflow: (data: any) => api.post('/workflows', data),
  executeWorkflow: (id: string) => api.post(`/workflows/${id}/execute`),
  cancelWorkflow: (id: string) => api.post(`/workflows/${id}/cancel`),
  
  // Models
  getProviders: () => api.get('/models/providers'),
  modelRequest: (data: any) => api.post('/models/request', data),
  createBridge: (data: any) => api.post('/models/bridge', data),
  fusedRequest: (data: any) => api.post('/models/fused-request', data),
  getBridges: () => api.get('/models/bridges'),
  
  // Metrics
  getMetrics: () => api.get('/metrics'),
  getHealth: () => api.get('/metrics/health'),
  getSystemInfo: () => api.get('/metrics/system'),
  
  // Admin
  getAdminStats: () => api.get('/admin/stats'),
};