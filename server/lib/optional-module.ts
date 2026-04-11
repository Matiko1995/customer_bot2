export async function importOptionalModule<T>(moduleName: string, installHint?: string): Promise<T> {
  try {
    const runtimeImport = new Function('name', 'return import(name)') as (name: string) => Promise<T>
    return await runtimeImport(moduleName)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    const hint = installHint ? ` 请先安装依赖：${installHint}` : ''
    throw new Error(`Optional module "${moduleName}" is unavailable.${hint} 原始错误：${detail}`)
  }
}
