const childProcess = require('node:child_process')
const { EventEmitter } = require('node:events')
const { syncBuiltinESMExports, registerHooks } = require('node:module')
const { pathToFileURL } = require('node:url')
const path = require('node:path')

const originalExec = childProcess.exec.bind(childProcess)

function createNoopChild() {
  const child = new EventEmitter()
  child.stdout = null
  child.stderr = null
  child.kill = () => true
  return child
}

childProcess.exec = function patchedExec(command, ...args) {
  if (typeof command === 'string' && command.trim() === 'net use') {
    const callback = args.find((arg) => typeof arg === 'function')
    queueMicrotask(() => {
      if (callback) {
        callback(null, '', '')
      }
    })
    return createNoopChild()
  }

  return originalExec(command, ...args)
}

syncBuiltinESMExports()

if (typeof registerHooks === 'function') {
  const shimUrl = pathToFileURL(path.resolve(__dirname, 'esbuild-shim.mjs')).href
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier === 'esbuild') {
        return {
          url: shimUrl,
          shortCircuit: true
        }
      }

      return nextResolve(specifier, context)
    }
  })
}
