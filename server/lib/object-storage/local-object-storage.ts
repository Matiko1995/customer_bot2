import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import type { ObjectStorageProvider, StoredObjectDescriptor } from './object-storage.ts'

const localObjectStorageRoot = resolve(process.cwd(), '.data')

function toAbsolutePath(key: string): string {
  if (/^[a-zA-Z]:\\/.test(key) || key.startsWith('/')) {
    return key
  }

  return join(localObjectStorageRoot, key)
}

function toRelativePath(absolutePath: string): string {
  const normalizedRoot = localObjectStorageRoot.replace(/\\/g, '/').replace(/\/+$/, '')
  const normalizedTarget = absolutePath.replace(/\\/g, '/')

  if (normalizedTarget.startsWith(normalizedRoot)) {
    return `.data/${normalizedTarget.slice(normalizedRoot.length + 1)}`
  }

  return normalizedTarget
}

async function ensureParent(path: string) {
  await mkdir(dirname(path), { recursive: true })
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function descriptorFromPath(path: string): StoredObjectDescriptor {
  return {
    key: path,
    relativePath: toRelativePath(path),
    localPath: path
  }
}

export function createLocalObjectStorageProvider(): ObjectStorageProvider {
  return {
    kind: 'local',
    async writeBuffer(input) {
      const path = toAbsolutePath(input.key)
      await ensureParent(path)
      await writeFile(path, input.contents)
      return descriptorFromPath(path)
    },
    async writeText(input) {
      const path = toAbsolutePath(input.key)
      await ensureParent(path)
      await writeFile(path, input.content, 'utf8')
      return descriptorFromPath(path)
    },
    async readBuffer(key) {
      return readFile(toAbsolutePath(key))
    },
    async readText(key) {
      return readFile(toAbsolutePath(key), 'utf8')
    },
    async list(prefix) {
      const directory = toAbsolutePath(prefix)
      try {
        const files = await readdir(directory)
        return files.map((fileName) => join(prefix, fileName).replace(/\\/g, '/'))
      } catch {
        return []
      }
    },
    async exists(key) {
      return exists(toAbsolutePath(key))
    }
  }
}
