import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const esbuild = require(path.resolve(__dirname, '../node_modules/esbuild/lib/main.js'))

function applyDefines(code, define) {
  let nextCode = String(code)
  const replacements = Object.entries(define || {}).sort((left, right) => right[0].length - left[0].length)

  for (const [key, value] of replacements) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    nextCode = nextCode.replace(new RegExp(escaped, 'g'), String(value))
  }

  return nextCode
}

function createSourceMap(sourcefile) {
  return JSON.stringify({
    version: 3,
    sources: [sourcefile || 'virtual.ts'],
    names: [],
    mappings: '',
    sourcesContent: []
  })
}

function transpileWithTypeScript(code, options = {}) {
  const loader = options.loader || 'js'
  const source = applyDefines(code, options.define)
  const result = ts.transpileModule(source, {
    fileName: options.sourcefile || 'virtual.ts',
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2019,
      sourceMap: false,
      jsx: loader === 'tsx' || loader === 'jsx' ? ts.JsxEmit.Preserve : undefined
    }
  })

  return {
    code: result.outputText,
    map: createSourceMap(options.sourcefile),
    warnings: []
  }
}

export async function transform(code, options = {}) {
  const loader = options.loader || 'js'

  if (loader === 'ts' || loader === 'tsx' || loader === 'js' || loader === 'jsx') {
    return transpileWithTypeScript(code, options)
  }

  return esbuild.transform(code, options)
}

export function transformSync(code, options = {}) {
  const loader = options.loader || 'js'

  if (loader === 'ts' || loader === 'tsx' || loader === 'js' || loader === 'jsx') {
    return transpileWithTypeScript(code, options)
  }

  return esbuild.transformSync(code, options)
}

export const build = esbuild.build
export const buildSync = esbuild.buildSync
export const context = esbuild.context
export const formatMessages = esbuild.formatMessages
export const analyzeMetafile = esbuild.analyzeMetafile
export const analyzeMetafileSync = esbuild.analyzeMetafileSync
export const initialize = esbuild.initialize
export const stop = esbuild.stop
export const version = esbuild.version
export default {
  ...esbuild,
  transform,
  transformSync
}
