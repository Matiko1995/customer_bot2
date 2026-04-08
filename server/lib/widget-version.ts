import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function getWidgetVersion(configuredVersion?: string): string {
  if (configuredVersion?.trim()) {
    return configuredVersion.trim()
  }

  try {
    const filePath = resolve(process.cwd(), 'dist/widget-version.json')
    const payload = JSON.parse(readFileSync(filePath, 'utf8')) as { version?: string }
    return payload.version?.trim() || 'dev'
  } catch {
    return 'dev'
  }
}
