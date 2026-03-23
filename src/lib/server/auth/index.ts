/**
 * Authentication Index
 * Exports all auth-related functions
 */

export { hashPassword, verifyPassword, type HashedPassword } from './password';
export { 
  createAccessToken, 
  createRefreshToken, 
  verifyToken, 
  decodeToken,
  generateSessionId,
  type TokenPayload, 
  type TokenPair 
} from './jwt';

import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

/**
 * Middleware: Require authenticated user
 * Throws 401 if not authenticated
 */
export function requireAuth(event: RequestEvent) {
  if (!event.locals.user) {
    throw json({ error: 'Unauthorized' }, { status: 401 });
  }
  return event.locals.user;
}

/**
 * Middleware: Require verified user
 * Throws 401 if not authenticated
 */
export function requireVerified(event: RequestEvent) {
  const user = requireAuth(event);
  // Add additional verification checks here if needed
  return user;
}
