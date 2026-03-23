import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';
import { encrypt } from '$lib/server/encryption';
import { testCloudflareConnection } from '$lib/server/cloudflare/analytics';

export const GET: RequestHandler = async ({ locals, platform }) => {
  const user = requireAuth({ locals } as any);
  
  const accounts = await platform!.env.DB.prepare(
    `SELECT id, account_name, account_id, auth_type, is_active, last_sync, created_at 
     FROM cloudflare_accounts WHERE user_id = ? ORDER BY created_at DESC`
  ).bind(user.id).all();
  
  return json({ accounts: accounts.results });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
  const user = requireAuth({ locals } as any);
  const body = await request.json();
  
  const { accountName, accountId, apiToken, authType = 'api_token' } = body;
  
  if (!accountName || !accountId || !apiToken) {
    throw error(400, 'Account name, Account ID, and API Token are required');
  }
  
  // Test connection before saving
  const connectionTest = await testCloudflareConnection(accountId, apiToken);
  if (!connectionTest.success) {
    throw error(400, `Failed to connect to Cloudflare: ${connectionTest.error}`);
  }
  
  // Encrypt API token
  const encrypted = await encrypt(apiToken, platform!.env.ENCRYPTION_KEY);
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await platform!.env.DB.prepare(
    `INSERT INTO cloudflare_accounts (id, user_id, account_name, account_id, api_token_encrypted, api_token_iv, api_token_tag, auth_type, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  ).bind(id, user.id, accountName, accountId, encrypted.ciphertext, encrypted.iv, encrypted.tag, authType, now, now).run();
  
  return json({ 
    success: true, 
    account: { id, accountName, accountId, authType, isActive: true, createdAt: now } 
  });
};
