import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyPassword, type HashedPassword } from '$lib/server/auth/password';
import { createAccessToken, createRefreshToken, generateSessionId } from '$lib/server/auth/jwt';

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
  if (!platform?.env?.DB || !platform?.env?.JWT_SECRET) {
    throw error(500, 'Server configuration error');
  }
  
  const body = await request.json();
  const { email, password } = body;
  
  if (!email || !password) {
    throw error(400, 'Email and password are required');
  }
  
  const user = await platform.env.DB.prepare(
    'SELECT * FROM users WHERE email = ? AND is_active = 1'
  ).bind(email.toLowerCase()).first() as any;
  
  if (!user) {
    throw error(401, 'Invalid email or password');
  }
  
  const hashedPassword: HashedPassword = {
    hash: user.password_hash, salt: user.password_salt, iterations: 100000, algorithm: 'PBKDF2-SHA256'
  };
  
  const valid = await verifyPassword(password, hashedPassword);
  if (!valid) {
    throw error(401, 'Invalid email or password');
  }
  
  const sessionId = generateSessionId();
  const refreshToken = await createRefreshToken({ userId: user.id, email: user.email, sessionId }, platform.env.JWT_SECRET);
  
  const encoder = new TextEncoder();
  const refreshTokenHash = await crypto.subtle.digest('SHA-256', encoder.encode(refreshToken));
  const refreshTokenHashBase64 = btoa(String.fromCharCode(...new Uint8Array(refreshTokenHash)));
  
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  await platform.env.DB.prepare(
    `INSERT INTO user_sessions (id, user_id, refresh_token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`
  ).bind(sessionId, user.id, refreshTokenHashBase64, expiresAt, now).run();
  
  const { token: accessToken, expiresIn } = await createAccessToken({ userId: user.id, email: user.email, sessionId }, platform.env.JWT_SECRET);
  
  cookies.set('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: expiresIn, path: '/' });
  cookies.set('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 604800, path: '/' });
  
  return json({ success: true, user: { id: user.id, email: user.email, name: user.name }, expiresIn });
};
