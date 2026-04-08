#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import process from 'node:process'

const PROJECT_ROOT = process.cwd()
const OUTPUT_DIR = resolve(PROJECT_ROOT, '.output')
const DATA_DIR = resolve(PROJECT_ROOT, '.data')
const DIST_DIR = resolve(PROJECT_ROOT, 'dist')
const ARCHIVE_PATH = resolve(PROJECT_ROOT, 'build-output.tar.gz')

function assertExists(path, message) {
  if (!existsSync(path)) {
    throw new Error(message)
  }
}

function shouldCopyDataPath(sourcePath) {
  const name = basename(sourcePath)
  if (name === 'runtime-port.json') {
    return false
  }
  if (name.includes('.bak-')) {
    return false
  }
  return true
}

function runTar(stagingDir) {
  const result = spawnSync('tar', ['-czf', ARCHIVE_PATH, '.output', '.data', 'dist'], {
    cwd: stagingDir,
    env: {
      ...process.env,
      COPYFILE_DISABLE: '1'
    },
    stdio: 'pipe',
    encoding: 'utf8'
  })

  if (result.status !== 0) {
    const details = [result.stderr, result.stdout].filter(Boolean).join('\n').trim()
    throw new Error(details || '构建产物压缩失败')
  }
}

function main() {
  assertExists(OUTPUT_DIR, `未找到构建产物: ${OUTPUT_DIR}`)
  assertExists(resolve(OUTPUT_DIR, 'server', 'index.mjs'), '未找到 .output/server/index.mjs')
  assertExists(DATA_DIR, `未找到数据目录: ${DATA_DIR}`)
  assertExists(resolve(DIST_DIR, 'customer-bot.js'), '未找到 dist/customer-bot.js')

  rmSync(ARCHIVE_PATH, { force: true })
  const stagingDir = mkdtempSync(join(tmpdir(), 'aim-build-archive-'))

  try {
    cpSync(OUTPUT_DIR, resolve(stagingDir, '.output'), { recursive: true })
    cpSync(DIST_DIR, resolve(stagingDir, 'dist'), { recursive: true })
    cpSync(DATA_DIR, resolve(stagingDir, '.data'), {
      recursive: true,
      filter: shouldCopyDataPath
    })
    runTar(stagingDir)

    console.log(
      JSON.stringify(
        {
          archivePath: ARCHIVE_PATH,
          includes: ['.output', '.data', 'dist'],
          excludedDataFiles: ['runtime-port.json', '*.bak-*']
        },
        null,
        2
      )
    )
  } finally {
    rmSync(stagingDir, { recursive: true, force: true })
  }
}

main()
