import { setAdminSession, validateAdminCredentials } from '../../lib/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event)
  const email = body?.email?.trim() || ''
  const password = body?.password || ''

  if (!validateAdminCredentials(email, password)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  setAdminSession(event)

  return {
    ok: true
  }
})
