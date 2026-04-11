import type { RuntimeConfigRequest, RuntimeConfigResponse } from '../../../packages/contracts/src/embed/runtime-config.contract.ts'
import type { WidgetScriptResponse } from '../../../packages/contracts/src/embed/widget-script.contract.ts'

export interface EmbedDeliveryApplicationDependencies {
  getRuntimeConfig: (tenantId: string) => Promise<RuntimeConfigResponse>
  getWidgetScript: () => Promise<WidgetScriptResponse>
}

export class EmbedDeliveryApplication {
  private readonly deps: EmbedDeliveryApplicationDependencies

  constructor(deps: EmbedDeliveryApplicationDependencies) {
    this.deps = deps
  }

  runtimeConfig(input: RuntimeConfigRequest): Promise<RuntimeConfigResponse> {
    return this.deps.getRuntimeConfig(input.tenantId)
  }

  widgetScript(): Promise<WidgetScriptResponse> {
    return this.deps.getWidgetScript()
  }
}
