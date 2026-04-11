import { resolve } from 'node:path'
import type { TenantRecord } from '../../types'
import { DEMO_TENANT_ID } from '../../lib/demo-config.ts'
import { createDefaultTenantRagSettings } from '../../packages/shared-config/src/rag-settings.ts'

export function getStorageFilePath() {
  return process.env.CUSTOMER_BOT_DATA_FILE || resolve(process.cwd(), '.data/customer-bot-storage.json')
}

export function createDemoTenant(): TenantRecord {
  const now = Date.now()

  return {
    id: DEMO_TENANT_ID,
    name: 'Demo Tenant',
    status: 'active',
    brandName: 'AIFactory Demo Bot',
    themeColor: '#118ab2',
    contactPhone: '+86 138-0000-0000',
    contactEmail: 'demo@example.com',
    contactAddress: 'Shanghai',
    systemPrompt:
      '你是 AIFactory 的 AI 客服演示助手。请优先回答产品能力、部署方式、报价流程，并主动引导用户留资。',
    embedKey: 'embed-demo-tenant',
    ragSettings: createDefaultTenantRagSettings(),
    billingSubscription: {
      planId: 'plan-standard',
      startedAt: now,
      notes: 'demo tenant default plan'
    },
    contentConfig: undefined,
    createdAt: now,
    updatedAt: now
  }
}
