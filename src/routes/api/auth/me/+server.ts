import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';

export const GET: RequestHandler = async ({ locals }) => {
  const user = requireAuth({ locals } as any);
  return json({ user: { id: user.id, email: user.email } });
};
