// Cloudflare Analytics Dashboard - Type Definitions
// See https://svelte.dev/docs/kit/types#app.d.ts

declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
      status?: number;
    }
    
    interface Locals {
      user?: UserSession;
    }
    
    interface PageData {}
    
    interface Platform {
      env: Env;
    }
  }
}

// Environment bindings
interface Env {
  DB: D1Database;
  KV: KVNamespace;
  ENCRYPTION_KEY: string;
  JWT_SECRET: string;
  PREVIOUS_ENCRYPTION_KEY?: string;
}

// User session stored in locals
interface UserSession {
  id: string;
  email: string;
  name: string | null;
  sessionId: string;
}

// Database types
interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  name: string | null;
  is_active: number;
  is_verified: number;
  created_at: string;
  updated_at: string;
}

interface DbCloudflareAccount {
  id: string;
  user_id: string;
  account_name: string;
  account_id: string;
  api_token_encrypted: string;
  api_token_iv: string;
  api_token_tag: string;
  auth_type: 'api_token' | 'global_key';
  is_active: number;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

interface DbWorker {
  id: string;
  account_id: string;
  script_name: string;
  script_id: string | null;
  is_active: number;
  last_sync: string | null;
  created_at: string;
}

interface DbSession {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: string;
  created_at: string;
}

interface DbAnalyticsCache {
  id: string;
  account_id: string;
  cache_key: string;
  cache_data: string;
  expires_at: string;
  created_at: string;
}

interface DbAuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: string | null;
  created_at: string;
}

// API types
interface CloudflareAccount {
  id: string;
  accountName: string;
  accountId: string;
  authType: 'api_token' | 'global_key';
  isActive: boolean;
  lastSync: string | null;
  createdAt: string;
}

// Cloudflare API response types
interface CfWorkerAnalytics {
  sum: {
    requests: number;
    errors: number;
  };
  avg: {
    cpuTime: number;
  };
  dimensions: {
    scriptName: string;
    datetime: string;
  };
}

interface CfPageTraffic {
  dimensions: {
    clientRequestPath: string;
    clientCountryName: string;
    clientDeviceType: string;
    cacheStatus: string;
  };
  sum: {
    requests: number;
    cachedRequests: number;
  };
  avg: {
    responseTime: number;
  };
}

interface CfCacheData {
  dimensions: {
    datetime: string;
    cacheStatus: string;
  };
  sum: {
    requests: number;
    cachedRequests: number;
  };
}

interface CfBotData {
  dimensions: {
    clientRequestPath: string;
    clientRequestUserAgent: string;
    botScore: number;
  };
  sum: {
    requests: number;
  };
}

// Analytics dashboard types
interface DashboardOverview {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  avgCpuTime: number;
  workers: WorkerAnalytics[];
}

interface WorkerAnalytics {
  accountId: string;
  accountName: string;
  workerId: string;
  workerName: string;
  data: CfWorkerAnalytics[];
}

interface BotAnalysis {
  totalRequests: number;
  botRequests: number;
  humanRequests: number;
  botPercentage: number;
  botsByType: Record<string, number>;
  knownBots: KnownBot[];
}

interface KnownBot {
  name: string;
  type: string;
  count: number;
  percentage: number;
}

export {};
