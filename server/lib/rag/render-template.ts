export function renderRagTemplate(
  template: string | undefined,
  variables: Record<string, string | number | undefined>
): string {
  const source = template?.trim() || ''
  if (!source) {
    return ''
  }

  return source.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
    const value = variables[key]
    return value === undefined || value === null ? '' : String(value)
  })
}
