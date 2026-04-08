import { createCustomerBot } from './widget'

const instance = createCustomerBot()

const globalApi = {
  init: instance.init,
  open: instance.open,
  close: instance.close,
  destroy: instance.destroy
}

if (typeof window !== 'undefined') {
  ;(window as Window & { CustomerBot?: typeof globalApi }).CustomerBot = globalApi
}

export { createCustomerBot, globalApi as CustomerBot }
