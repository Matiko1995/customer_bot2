import type { WidgetScriptResponse } from '../../../../../packages/contracts/src/embed/widget-script.contract.ts'
import type { EmbedDeliveryApplication } from '../../embed-delivery.application.ts'

export class WidgetScriptController {
  private readonly application: EmbedDeliveryApplication

  constructor(application: EmbedDeliveryApplication) {
    this.application = application
  }

  execute(): Promise<WidgetScriptResponse> {
    return this.application.widgetScript()
  }
}
