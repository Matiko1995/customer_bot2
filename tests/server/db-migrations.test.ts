import { describe, expect, it } from 'vitest'
import { listMigrationFiles } from '../../server/lib/db/run-migrations'

describe('db migrations', () => {
  it('loads rag migration files in ascending order', () => {
    expect(listMigrationFiles()).toEqual([
      '0001_rag_core.sql',
      '0002_usage_provenance.sql'
    ])
  })
})
