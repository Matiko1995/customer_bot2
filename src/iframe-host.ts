export interface IframeHostOptions {
  iframeSrc: string
}

export function createIframeHost() {
  let container: HTMLElement | null = null

  return {
    mount(options: IframeHostOptions) {
      if (container) {
        return
      }

      container = document.createElement('div')
      container.className = 'cbot-iframe-host'
      container.innerHTML = `
        <iframe
          title="Customer Bot"
          src="${options.iframeSrc}"
          style="position:fixed;right:16px;bottom:16px;width:380px;height:640px;border:0;border-radius:16px;box-shadow:0 20px 52px rgba(20,33,61,.2);z-index:9999;background:#fff;"
        ></iframe>
      `
      document.body.appendChild(container)
    },
    destroy() {
      container?.remove()
      container = null
    }
  }
}
