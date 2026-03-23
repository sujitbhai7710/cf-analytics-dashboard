-- Migration: Add cf_email column for global_api_key auth type
ALTER TABLE cloudflare_accounts ADD COLUMN cf_email TEXT;
