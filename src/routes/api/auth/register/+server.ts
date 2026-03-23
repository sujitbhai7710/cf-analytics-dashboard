import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hashPassword } from '$lib/server/auth/password';
import { createAccessToken, createRefreshToken, generateSessionId } from '$lib/server/auth/jwt';

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
  if (!platform?.env?.DB || !platform?.env?.JWT_SECRET) {
    throw error(500, 'Server configuration error');
  }
  
  const body = await request.json();
  const { email, password, name } = body;
  
  if (!email || !password) {
    throw error(400, 'Email and password are required');
  }
  
  if (password.length < 8) {
    throw error(400, 'Password must be at least 8 characters');
  }
  
  // Check if user exists
  const existingUser = await platform.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first();
  
  if (existingUser) {
    throw error(400, 'Email already registered');
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Create user
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await platform.env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, password_salt, name, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
  ).bind(userId, email.toLowerCase(), hashedPassword.hash, hashedPassword.salt, name || null, now, now).run();
  
  // Create session
  const sessionId = generateSessionId();
  const refreshToken = await createRefreshToken({ userId, email, sessionId }, platform.env.JWT_SECRET);
  
  const encoder = new TextEncoder();
  const refreshTokenHash = await crypto.subtle.digest('SHA-256', encoder.encode(refreshToken));
  const refreshTokenHashBase64 = btoa(String.fromCharCode(...new Uint8Array(refreshTokenHash)));
  
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  await platform.env.DB.prepare(
    `INSERT INTO user_sessions (id, user_id, refresh_token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(sessionId, userId, refreshTokenHashBase64, expiresAt, now).run();
  
  const { token: accessToken, expiresIn } = await createAccessToken({ userId, email, sessionId }, platform.env.JWT_SECRET);
  
  cookies.set('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: expiresIn, path: '/' });
  cookies.set('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 604800, path: '/' });
  
  return json({ success: true, user: { id: userId, email: email.toLowerCase(), name: name || null }, expiresIn });
};
