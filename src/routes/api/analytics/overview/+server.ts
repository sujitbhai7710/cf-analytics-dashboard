import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';
import { decrypt } from '$lib/server/encryption';
import { getWorkerInvocations, getWorkersList } from '$lib/server/cloudflare/analytics';

export const GET: RequestHandler = async ({ url, locals, platform }) => {
  const user = requireAuth({ locals } as any);
  const accountId = url.searchParams.get('accountId');
  const period = url.searchParams.get('period') || '24h';
  
  const end = new Date();
  const start = new Date();
  switch (period) {
    case '7d': start.setDate(start.getDate() - 7); break;
    case '30d': start.setDate(start.getDate() - 30); break;
    default: start.setHours(start.getHours() - 24);
  }
  
  let query = platform!.env.DB.prepare(
    `SELECT id, account_name, account_id, api_token_encrypted, api_token_iv, api_token_tag 
     FROM cloudflare_accounts WHERE user_id = ? AND is_active = 1`
  ).bind(user.id);
  
  if (accountId) {
    query = platform!.env.DB.prepare(
      `SELECT id, account_name, account_id, api_token_encrypted, api_token_iv, api_token_tag 
       FROM cloudflare_accounts WHERE id = ? AND user_id = ? AND is_active = 1`
    ).bind(accountId, user.id);
  }
  
  const accountsResult = await query.all();
  const accounts = accountsResult.results as any[];
  
  const analyticsData = [];
  const totals = { totalRequests: 0, totalErrors: 0, avgCpuTime: 0 };
  let dataPoints = 0;
  
  for (const account of accounts) {
    try {
      const apiToken = await decrypt(
        { ciphertext: account.api_token_encrypted, iv: account.api_token_iv, tag: account.api_token_tag },
        platform!.env.ENCRYPTION_KEY
      );
      
      const workers = await getWorkersList(account.account_id, apiToken);
      
      const workerAnalytics = [];
      for (const worker of workers.slice(0, 10)) {
        const data = await getWorkerInvocations(account.account_id, apiToken, {
          scriptName: worker.script, start, end, limit: 100
        });
        
        for (const point of data) {
          totals.totalRequests += point.sum.requests || 0;
          totals.totalErrors += point.sum.errors || 0;
          totals.avgCpuTime += point.avg.cpuTime || 0;
          dataPoints++;
        }
        
        workerAnalytics.push({ name: worker.script, data });
      }
      
      analyticsData.push({ accountId: account.id, accountName: account.account_name, workers: workerAnalytics });
    } catch (e) {
      console.error(`Failed to fetch analytics for ${account.account_name}:`, e);
    }
  }
  
  if (dataPoints > 0) totals.avgCpuTime /= dataPoints;
  
  return json({ ...totals, accounts: analyticsData });
};
