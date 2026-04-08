import { requireAdminSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const storage = getStorage()
  const query = getQuery(event)
  const includeDeleted = String(query.includeDeleted || '') === '1'
  const items = await storage.listTenants()

  return {
    items: includeDeleted ? items : items.filter((item) => !item.deletedAt)
  }
})
