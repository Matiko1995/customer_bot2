import type { RuntimeConfigRequest, RuntimeConfigResponse } from '../../../../../packages/contracts/src/embed/runtime-config.contract.ts'
import type { EmbedDeliveryApplication } from '../../embed-delivery.application.ts'

export class EmbedConfigController {
  private readonly application: EmbedDeliveryApplication

  constructor(application: EmbedDeliveryApplication) {
    this.application = application
  }

  execute(input: RuntimeConfigRequest): Promise<RuntimeConfigResponse> {
    return this.application.runtimeConfig(input)
  }
}
