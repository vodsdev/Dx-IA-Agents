import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
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

  generateMfaSecret(): { otpauthUrl: string; base32: string } {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: 'Dx-IA-Agents',
    });
    return { otpauthUrl: secret.otpauth_url!, base32: secret.base32 };
  }

  verifyMfaToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1, // Allow a 30-second window for token validity
    });
  }
}

export const auth = new Auth();