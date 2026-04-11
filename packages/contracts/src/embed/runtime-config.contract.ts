import type { RuntimeWidgetConfig } from '../../../../types'

export interface RuntimeConfigRequest {
  tenantId: string
}

export type RuntimeConfigResponse = RuntimeWidgetConfig
