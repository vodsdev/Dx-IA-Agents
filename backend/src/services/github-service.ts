import axios from 'axios';

export class GitHubService {
  private token: string;
  private baseUrl: string = 'https://api.github.com';
  
  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN || '';
  }
  
  private get headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
    };
  }
  
  async createPullRequest(owner: string, repo: string, title: string, head: string, base: string, body?: string): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/repos/${owner}/${repo}/pulls`,
      { title, head, base, body },
      { headers: this.headers }
    );
    return response.data;
  }
  
  async getPullRequest(owner: string, repo: string, prNumber: number): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`,
      { headers: this.headers }
    );
    return response.data;
  }
  
  async mergePullRequest(owner: string, repo: string, prNumber: number): Promise<any> {
    const response = await axios.put(
      `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/merge`,
      {},
      { headers: this.headers }
    );
    return response.data;
  }
  
  async createIssue(owner: string, repo: string, title: string, body?: string, labels?: string[]): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/repos/${owner}/${repo}/issues`,
      { title, body, labels },
      { headers: this.headers }
    );
    return response.data;
  }
  
  async getRepository(owner: string, repo: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/repos/${owner}/${repo}`,
      { headers: this.headers }
    );
    return response.data;
  }
}

export const githubService = new GitHubService();