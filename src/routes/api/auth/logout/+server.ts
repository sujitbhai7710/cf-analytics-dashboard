import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, locals, platform }) => {
  if (locals.user && platform?.env?.DB) {
    await platform.env.DB.prepare('DELETE FROM user_sessions WHERE id = ?').bind(locals.user.sessionId).run();
  }
  cookies.delete('accessToken', { path: '/' });
  cookies.delete('refreshToken', { path: '/' });
  return json({ success: true });
};
