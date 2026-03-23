import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';
import { encrypt } from '$lib/server/encryption';
import { testCloudflareConnection, type CloudflareAuth } from '$lib/server/cloudflare/analytics';

export const GET: RequestHandler = async ({ locals, platform }) => {
  const user = requireAuth({ locals } as any);
  
  const accounts = await platform!.env.DB.prepare(
    `SELECT id, account_name, account_id, is_active, last_sync, created_at 
     FROM cloudflare_accounts WHERE user_id = ? ORDER BY created_at DESC`
  ).bind(user.id).all();
  
  // Format response
  const safeAccounts = accounts.results?.map((acc: any) => ({
    id: acc.id,
    accountName: acc.account_name,
    accountId: acc.account_id,
    isActive: acc.is_active,
    lastSync: acc.last_sync,
    createdAt: acc.created_at
  })) || [];
  
  return json({ accounts: safeAccounts });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
  const user = requireAuth({ locals } as any);
  const body = await request.json();
  
  const { accountName, accountId, apiToken } = body;
  
  // Validate required fields
  if (!accountName || !accountId || !apiToken) {
    throw error(400, 'Account name, Account ID, and API Token are all required');
  }
  
  // Build auth object for testing - API Token only
  const auth: CloudflareAuth = {
    type: 'api_token',
    apiToken: apiToken
  };
  
  // Test connection before saving
  const connectionTest = await testCloudflareConnection(accountId, auth);
  if (!connectionTest.success) {
    throw error(400, `Failed to connect to Cloudflare: ${connectionTest.error}. Make sure your API Token has the required permissions.`);
  }
  
  // Encrypt API token
  const encrypted = await encrypt(apiToken, platform!.env.ENCRYPTION_KEY);
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await platform!.env.DB.prepare(
    `INSERT INTO cloudflare_accounts (id, user_id, account_name, account_id, api_token_encrypted, api_token_iv, api_token_tag, auth_type, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'api_token', 1, ?, ?)`
  ).bind(id, user.id, accountName, accountId, encrypted.ciphertext, encrypted.iv, encrypted.tag, now, now).run();
  
  return json({ 
    success: true, 
    account: { 
      id, 
      accountName, 
      accountId, 
      authType: 'api_token',
      isActive: true, 
      createdAt: now 
    } 
  });
};

export const DELETE: RequestHandler = async ({ request, locals, platform }) => {
  const user = requireAuth({ locals } as any);
  const body = await request.json();
  
  const { accountId } = body;
  
  if (!accountId) {
    throw error(400, 'Account ID is required');
  }
  
  await platform!.env.DB.prepare(
    'DELETE FROM cloudflare_accounts WHERE id = ? AND user_id = ?'
  ).bind(accountId, user.id).run();
  
  return json({ success: true });
};
