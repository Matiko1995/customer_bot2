CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS data_sources (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  sync_mode TEXT NOT NULL,
  schedule_cron TEXT,
  config_json JSONB NOT NULL,
  last_synced_at BIGINT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  data_source_id TEXT NOT NULL,
  trigger_mode TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at BIGINT,
  finished_at BIGINT,
  error_message TEXT,
  stats_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS source_documents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  data_source_id TEXT NOT NULL,
  external_id TEXT,
  title TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  source_uri TEXT NOT NULL,
  content_text TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_hash TEXT NOT NULL,
  version_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS document_chunks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_at BIGINT NOT NULL
);
