import { getRuntimeConfigForTenant, TenantNotFoundError } from '../../lib/tenants'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tenantId = typeof query.tenantId === 'string' ? query.tenantId.trim() : ''

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'tenantId is required'
    })
  }

  try {
    return await getRuntimeConfigForTenant(tenantId)
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tenant not found'
      })
    }

    throw error
  }
})
