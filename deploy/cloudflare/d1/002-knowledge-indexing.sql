CREATE TABLE IF NOT EXISTS data_sources (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  sync_mode TEXT NOT NULL,
  schedule_cron TEXT,
  config_json TEXT NOT NULL,
  last_synced_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_data_sources_tenant_id ON data_sources(tenant_id);

CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  data_source_id TEXT NOT NULL,
  trigger_mode TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at INTEGER,
  finished_at INTEGER,
  error_message TEXT,
  stats_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_tenant_id ON ingestion_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_source_id ON ingestion_jobs(data_source_id);

CREATE TABLE IF NOT EXISTS source_documents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  data_source_id TEXT NOT NULL,
  external_id TEXT,
  title TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  source_uri TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  version_hash TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_source_documents_tenant_id ON source_documents(tenant_id);

CREATE TABLE IF NOT EXISTS document_chunks_meta (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_meta_document_id ON document_chunks_meta(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_meta_tenant_id ON document_chunks_meta(tenant_id);
