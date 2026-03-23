import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';
import { encrypt } from '$lib/server/encryption';
import { testCloudflareConnection, type CloudflareAuth } from '$lib/server/cloudflare/analytics';

export const GET: RequestHandler = async ({ locals, platform }) => {
  const user = requireAuth({ locals } as any);
  
  const accounts = await platform!.env.DB.prepare(
    `SELECT id, account_name, account_id, auth_type, cf_email, is_active, last_sync, created_at 
     FROM cloudflare_accounts WHERE user_id = ? ORDER BY created_at DESC`
  ).bind(user.id).all();
  
  // Remove sensitive data from response
  const safeAccounts = accounts.results?.map((acc: any) => ({
    id: acc.id,
    accountName: acc.account_name,
    accountId: acc.account_id,
    authType: acc.auth_type,
    cfEmail: acc.cf_email,
    isActive: acc.is_active,
    lastSync: acc.last_sync,
    createdAt: acc.created_at
  })) || [];
  
  return json({ accounts: safeAccounts });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
  const user = requireAuth({ locals } as any);
  const body = await request.json();
  
  const { accountName, accountId, apiToken, email, authType = 'api_token' } = body;
  
  if (!accountName || !accountId) {
    throw error(400, 'Account name and Account ID are required');
  }
  
  // Validate based on auth type
  if (authType === 'api_token') {
    if (!apiToken) {
      throw error(400, 'API Token is required for api_token auth type');
    }
  } else if (authType === 'global_api_key') {
    if (!email || !apiToken) {
      throw error(400, 'Email and API Key are required for global_api_key auth type');
    }
  } else {
    throw error(400, 'Invalid auth type. Use "api_token" or "global_api_key"');
  }
  
  // Build auth object for testing
  const auth: CloudflareAuth = {
    type: authType,
    apiToken: authType === 'api_token' ? apiToken : undefined,
    email: authType === 'global_api_key' ? email : undefined,
    globalKey: authType === 'global_api_key' ? apiToken : undefined
  };
  
  // Test connection before saving
  const connectionTest = await testCloudflareConnection(accountId, auth);
  if (!connectionTest.success) {
    throw error(400, `Failed to connect to Cloudflare: ${connectionTest.error}`);
  }
  
  // Encrypt API token/key
  const encrypted = await encrypt(apiToken, platform!.env.ENCRYPTION_KEY);
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  // Store email for global_api_key type
  const cfEmail = authType === 'global_api_key' ? email : null;
  
  await platform!.env.DB.prepare(
    `INSERT INTO cloudflare_accounts (id, user_id, account_name, account_id, api_token_encrypted, api_token_iv, api_token_tag, auth_type, cf_email, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  ).bind(id, user.id, accountName, accountId, encrypted.ciphertext, encrypted.iv, encrypted.tag, authType, cfEmail, now, now).run();
  
  return json({ 
    success: true, 
    account: { 
      id, 
      accountName, 
      accountId, 
      authType, 
      cfEmail,
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
