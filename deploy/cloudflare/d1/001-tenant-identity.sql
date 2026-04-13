CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  theme_color TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_address TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  llm_endpoint TEXT,
  llm_api_key TEXT,
  llm_model TEXT,
  reuse_answered_questions INTEGER NOT NULL DEFAULT 1,
  deleted_at INTEGER,
  embed_key TEXT NOT NULL UNIQUE,
  rag_settings_json TEXT,
  billing_subscription_json TEXT,
  content_config_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tenants_embed_key ON tenants(embed_key);

CREATE TABLE IF NOT EXISTS tenant_users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  temporary_password TEXT,
  must_change_password INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);

CREATE TABLE IF NOT EXISTS tenant_password_resets (
  id TEXT PRIMARY KEY,
  tenant_user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tenant_password_resets_email_code ON tenant_password_resets(email, code);
