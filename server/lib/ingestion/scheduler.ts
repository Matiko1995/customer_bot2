export interface IngestionScheduler {
  start(): void
  stop(): void
  tick(): Promise<void>
}

export function createIngestionScheduler(input: {
  runDueJobs: () => Promise<void>
  intervalMs?: number
}): IngestionScheduler {
  const intervalMs = input.intervalMs ?? 60_000
  let timer: NodeJS.Timeout | undefined
  let running = false

  async function tick() {
    if (running) {
      return
    }

    running = true
    try {
      await input.runDueJobs()
    } finally {
      running = false
    }
  }

  return {
    start() {
      if (timer) {
        return
      }

      timer = setInterval(() => {
        void tick()
      }, intervalMs)
    },
    stop() {
      if (!timer) {
        return
      }

      clearInterval(timer)
      timer = undefined
    },
    tick
  }
}
