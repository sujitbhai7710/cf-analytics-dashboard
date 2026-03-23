/**
 * JWT Authentication using jose library
 * 
 * Access Token: 15 minutes expiry
 * Refresh Token: 7 days expiry
 */

import { SignJWT, jwtVerify, decodeJwt } from 'jose';

export interface TokenPayload {
  userId: string;
  email: string;
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Create JWT access token (15 minutes expiry)
 */
export async function createAccessToken(
  payload: TokenPayload,
  secret: string
): Promise<{ token: string; expiresIn: number }> {
  const secretKey = new TextEncoder().encode(secret);
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secretKey);
  
  return { token, expiresIn: 900 }; // 15 minutes in seconds
}

/**
 * Create refresh token (7 days expiry)
 */
export async function createRefreshToken(
  payload: TokenPayload,
  secret: string
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

/**
 * Verify JWT token
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<TokenPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Decode JWT without verification (for checking expiry)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return decodeJwt(token) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Generate a secure random string for session IDs
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}
