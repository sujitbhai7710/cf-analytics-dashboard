import type { Handle } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/auth/jwt';

export const handle: Handle = async ({ event, resolve }) => {
  const { cookies, locals, platform, request } = event;
  
  // Get token from cookie or Authorization header
  const token = cookies.get('accessToken') || 
    request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (token && platform?.env?.JWT_SECRET) {
    try {
      const payload = await verifyToken(token, platform.env.JWT_SECRET);
      
      if (payload) {
        // Verify session exists
        const session = await platform.env.DB.prepare(
          'SELECT id FROM user_sessions WHERE id = ? AND expires_at > datetime("now")'
        )
        .bind(payload.sessionId)
        .first();
        
        if (session) {
          locals.user = {
            id: payload.userId,
            email: payload.email,
            sessionId: payload.sessionId
          };
        }
      }
    } catch (e) {
      // Token invalid, clear cookie
      cookies.delete('accessToken', { path: '/' });
      cookies.delete('refreshToken', { path: '/' });
    }
  }
  
  return resolve(event);
};
