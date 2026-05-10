declare function defineNuxtConfig<T>(config: T): T

declare module 'pg' {
  export class Pool {
    constructor(options: { connectionString: string })
    query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>
    end(): Promise<void>
  }
}

declare module 'mammoth' {
  export function extractRawText(input: { path: string }): Promise<{ value: string }>
}

declare module 'xlsx' {
  export interface WorkSheet {}
  export interface WorkBook {
    SheetNames: string[]
    Sheets: Record<string, WorkSheet>
  }

  export function readFile(path: string): WorkBook

  export const utils: {
    sheet_to_json<T = unknown>(sheet: WorkSheet, options?: { header?: number; blankrows?: boolean }): T[]
  }
}

declare module 'imapflow' {
  export class ImapFlow {
    constructor(config: Record<string, unknown>)
  }
}

declare module 'lucide-vue-next/dist/esm/icons/*.js' {
  import type { FunctionalComponent, SVGAttributes } from 'vue'

  const icon: FunctionalComponent<
    SVGAttributes & {
      absoluteStrokeWidth?: boolean
      color?: string
      size?: number | string
      strokeWidth?: number | string
    }
  >

  export default icon
}
