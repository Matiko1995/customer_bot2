import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeDbPool, getDbPool } from './client.ts'

const currentDir = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(currentDir, 'migrations')

export function listMigrationFiles(): string[] {
  return readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right))
}

export function readMigrationFile(fileName: string): string {
  return readFileSync(join(migrationsDir, fileName), 'utf8')
}

export async function runMigrations() {
  const pool = await getDbPool()

  for (const fileName of listMigrationFiles()) {
    await pool.query(readMigrationFile(fileName))
  }
}

async function runFromCli() {
  try {
    await runMigrations()
    console.log(`Applied ${listMigrationFiles().length} migration(s).`)
  } finally {
    await closeDbPool()
  }
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  void runFromCli()
}
