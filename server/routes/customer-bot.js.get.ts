import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  const candidatePaths = [
    resolve(process.cwd(), 'dist/customer-bot.js'),
    resolve(process.cwd(), '.output/public/customer-bot.js')
  ]

  try {
    for (const filePath of candidatePaths) {
      try {
        const code = await readFile(filePath, 'utf8')
        setHeader(event, 'Content-Type', 'application/javascript; charset=utf-8')
        setHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
        return code
      } catch {}
    }

    throw createError({
      statusCode: 503,
      statusMessage: 'customer-bot.js not found. Ensure dist/customer-bot.js is deployed.'
    })
  } catch (error) {
    throw error
  }
})
