import { clearTenantSession } from '../../lib/auth'

export default defineEventHandler(async (event) => {
  clearTenantSession(event)

  return {
    ok: true
  }
})
