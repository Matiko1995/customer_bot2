import type { EmbedDeliveryApplication } from '../embed-delivery.application.ts'
import { EmbedConfigController } from './controllers/embed-config.controller.ts'
import { WidgetScriptController } from './controllers/widget-script.controller.ts'

export function createEmbedDeliveryHttpLayer(application: EmbedDeliveryApplication) {
  return {
    embedConfig: new EmbedConfigController(application),
    widgetScript: new WidgetScriptController(application)
  }
}
