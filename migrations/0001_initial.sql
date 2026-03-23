-- Migration: Initial Schema
-- Cloudflare Analytics Dashboard D1 Database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    name TEXT,
    is_active INTEGER DEFAULT 1,
    is_verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Cloudflare accounts table
CREATE TABLE IF NOT EXISTS cloudflare_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_id TEXT NOT NULL,
    api_token_encrypted TEXT NOT NULL,
    api_token_iv TEXT NOT NULL,
    api_token_tag TEXT NOT NULL,
    auth_type TEXT NOT NULL DEFAULT 'api_token',
    is_active INTEGER DEFAULT 1,
    last_sync TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Workers/Scripts table
CREATE TABLE IF NOT EXISTS cf_workers (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    script_name TEXT NOT NULL,
    script_id TEXT,
    is_active INTEGER DEFAULT 1,
    last_sync TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES cloudflare_accounts(id) ON DELETE CASCADE,
    UNIQUE(account_id, script_name)
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    refresh_token_hash TEXT UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics cache table
CREATE TABLE IF NOT EXISTS analytics_cache (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    cache_key TEXT NOT NULL,
    cache_data TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES cloudflare_accounts(id) ON DELETE CASCADE,
    UNIQUE(account_id, cache_key)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON cloudflare_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_cf_id ON cloudflare_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_workers_account ON cf_workers(account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON analytics_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
