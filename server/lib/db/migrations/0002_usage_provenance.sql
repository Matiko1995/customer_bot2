CREATE TABLE IF NOT EXISTS llm_usage_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

ALTER TABLE llm_usage_records
  ADD COLUMN IF NOT EXISTS credential_source TEXT;

ALTER TABLE llm_usage_records
  ADD COLUMN IF NOT EXISTS answer_source TEXT;
