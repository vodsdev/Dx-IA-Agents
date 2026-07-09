import jwt from 'jsonwebtoken';
import { config } from '../config/index';

export class Auth {
  generateToken(payload: { id: string; role: string }): string {
    return jwt.sign(payload, config.security.jwtSecret, {
      expiresIn: config.security.jwtExpiration,
    });
  }
  
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.security.jwtSecret);
    } catch (error) {
      return null;
    }
  }
  
  decodeToken(token: string): any {
    return jwt.decode(token);
  }
}

export const auth = new Auth();