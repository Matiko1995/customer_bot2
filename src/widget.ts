import { assistantKnowledgeEntries } from '../config/ai-assistant-knowledge'
import { demoArticles, demoConsultingServices, demoProducts, demoSiteConfig } from '../config/customer-bot-data'
import { buildAssistantReply, buildPriceAnswer } from '../lib/customer-bot'
import { createConversationHistoryStore } from './chat-history'
import { createIframeHost } from './iframe-host'
import { createLlmAdapter } from './llm-adapter'
import type {
  ArticleListItem,
  AssistantKnowledgeEntry,
  AssistantModuleId,
  ConsultingServiceListItem,
  ConversationMessage,
  MessageAttachment,
  ProductListItem,
  RuntimeWidgetConfig,
  SiteConfig
} from '../types'

type AssistantModule = AssistantModuleId

export interface CustomerBotInitOptions {
  mode?: 'inline' | 'iframe'
  iframeSrc?: string
  tenantId?: string
  apiBaseUrl?: string
  themeColor?: string
  siteName?: string
  submitEndpoint?: string
  llmEndpoint?: string
  apiKey?: string
  model?: string
  systemPrompt?: string
  fetcher?: typeof fetch
  soulProfile?: {
    role?: string
    tone?: string
    goals?: string[]
  }
  knowledge?: AssistantKnowledgeEntry[]
  articles?: ArticleListItem[]
  products?: ProductListItem[]
  consultingServices?: ConsultingServiceListItem[]
  contact?: Partial<SiteConfig>
}

export interface CustomerBotInstance {
  init(options?: CustomerBotInitOptions): void
  open(): void
  close(): void
  destroy(): void
}

const STYLE_ID = 'customer-bot-style'
const DEFAULT_THEME_COLOR = '#118ab2'

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function buildApiUrl(path: string, apiBaseUrl?: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (!apiBaseUrl) {
    return normalizedPath
  }

  return `${trimTrailingSlash(apiBaseUrl)}${normalizedPath}`
}

function ensureStyle(themeColor: string) {
  const existing = document.getElementById(STYLE_ID)
  if (existing) {
    return
  }

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .cbot-root {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 9999;
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: #102132;
      width: min(420px, calc(100vw - 24px));
    }
    .cbot-root[data-open="true"] .cbot-trigger {
      opacity: 0;
      pointer-events: none;
      transform: translateY(10px) scale(.98);
    }
    .cbot-trigger {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      border: 0;
      border-radius: 999px;
      background: linear-gradient(135deg, ${themeColor}, #0b5f7d);
      color: #fff;
      padding: 12px 16px 12px 14px;
      cursor: pointer;
      box-shadow: 0 18px 40px rgba(9, 45, 65, 0.28);
      transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
      overflow: hidden;
    }
    .cbot-trigger::after {
      content: "";
      position: absolute;
      inset: auto -40% -55% auto;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,.28), transparent 62%);
      pointer-events: none;
    }
    .cbot-trigger:hover {
      transform: translateY(-2px);
      box-shadow: 0 24px 46px rgba(9, 45, 65, 0.34);
    }
    .cbot-trigger-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      font-size: 16px;
      flex: none;
    }
    .cbot-trigger-copy {
      display: grid;
      gap: 2px;
      text-align: left;
    }
    .cbot-trigger-title {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.1;
    }
    .cbot-trigger-meta {
      font-size: 11px;
      line-height: 1.1;
      opacity: 0.82;
    }
    .cbot-trigger-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-left: 4px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.16);
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
    }
    .cbot-trigger-status::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #8cf0bd;
      box-shadow: 0 0 0 4px rgba(140, 240, 189, 0.16);
      flex: none;
    }
    .cbot-panel {
      display: none;
      width: 100%;
      height: min(720px, calc(100vh - 96px));
      margin-top: 12px;
      border: 1px solid rgba(188, 207, 220, 0.9);
      border-radius: 26px;
      background:
        radial-gradient(circle at top right, rgba(17, 138, 178, 0.12), transparent 34%),
        linear-gradient(180deg, #fcfeff, #f5f9fc 100%);
      overflow: hidden;
      box-shadow: 0 26px 70px rgba(20, 33, 61, 0.24);
      backdrop-filter: blur(8px);
    }
    .cbot-panel.is-open {
      display: grid;
      grid-template-rows: auto auto auto 1fr auto auto;
    }
    .cbot-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 14px;
      padding: 18px 18px 16px;
      background:
        radial-gradient(circle at top left, rgba(255,255,255,.38), transparent 30%),
        linear-gradient(135deg, rgba(11, 95, 125, 0.98), rgba(17, 138, 178, 0.92));
      border-bottom: 1px solid #e2e8f0;
    }
    .cbot-head-main {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      min-width: 0;
    }
    .cbot-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #fff;
      font-size: 14px;
      font-weight: 800;
      flex: none;
      backdrop-filter: blur(6px);
    }
    .cbot-head strong {
      display: block;
      font-size: 18px;
      line-height: 1.2;
      color: #fff;
    }
    .cbot-kicker {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(232, 246, 252, 0.82);
    }
    .cbot-subtitle {
      margin: 6px 0 0;
      font-size: 12px;
      line-height: 1.5;
      color: rgba(239, 248, 252, 0.84);
    }
    .cbot-service-line {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .cbot-service-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 10px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #f7fdff;
      font-size: 11px;
      line-height: 1;
      white-space: nowrap;
    }
    .cbot-close {
      width: 34px;
      height: 34px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      cursor: pointer;
      flex: none;
      backdrop-filter: blur(6px);
    }
    .cbot-templates {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid #edf2f7;
      overflow-x: auto;
      background: rgba(249, 251, 255, 0.8);
    }
    .cbot-overview {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      padding: 12px 16px 14px;
      border-bottom: 1px solid #edf2f7;
      background: rgba(249, 251, 255, 0.78);
      min-width: 0;
    }
    .cbot-overview-card {
      min-width: 0;
      padding: 10px 12px;
      border: 1px solid #dbe7f0;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.88);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
    }
    .cbot-overview-card.is-emphasis {
      border-color: rgba(17, 138, 178, 0.26);
      background: linear-gradient(180deg, rgba(230, 246, 252, 0.96), rgba(255, 255, 255, 0.96));
    }
    .cbot-overview-label {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #688197;
    }
    .cbot-overview-value {
      margin: 0;
      font-size: 13px;
      line-height: 1.45;
      color: #153147;
    }
    .cbot-context {
      display: grid;
      gap: 8px;
      padding: 12px 16px 14px;
      border-bottom: 1px solid #edf2f7;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 251, 254, 0.92));
      min-width: 0;
    }
    .cbot-context-label {
      margin: 0;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #688197;
    }
    .cbot-context-copy {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      color: #264156;
    }
    .cbot-welcome {
      display: grid;
      gap: 10px;
      margin-bottom: 14px;
      padding: 14px;
      border: 1px solid #dce8f1;
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(243, 248, 252, 0.96));
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }
    .cbot-welcome-title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.4;
      color: #173247;
    }
    .cbot-welcome-copy {
      margin: 0;
      font-size: 12px;
      line-height: 1.65;
      color: #5a7489;
    }
    .cbot-welcome-list {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .cbot-welcome-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12px;
      line-height: 1.55;
      color: #274156;
    }
    .cbot-welcome-dot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(17, 138, 178, 0.12);
      color: #0f6f90;
      font-size: 11px;
      font-weight: 700;
      flex: none;
      margin-top: 1px;
    }
    .cbot-template-btn,
    .cbot-send,
    .cbot-contact-submit {
      border-radius: 999px;
      cursor: pointer;
      transition: transform .16s ease, border-color .16s ease, background .16s ease, color .16s ease;
    }
    .cbot-template-btn {
      padding: 7px 12px;
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid #d7e3ef;
      color: #35526f;
      white-space: nowrap;
    }
    .cbot-template-btn:hover,
    .cbot-send:hover,
    .cbot-contact-submit:hover {
      transform: translateY(-1px);
    }
    .cbot-chat-log {
      display: flex;
      flex-direction: column;
      overflow: auto;
      padding: 14px 16px 10px;
      background:
        linear-gradient(180deg, rgba(250, 252, 255, 0.85), rgba(245, 250, 253, 0.92)),
        radial-gradient(circle at 0% 0%, rgba(17, 138, 178, 0.06), transparent 30%);
      min-height: 0;
    }
    .cbot-chat-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: min-content;
    }
    .cbot-message-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
    }
    .cbot-message-row.is-user {
      justify-content: flex-end;
    }
    .cbot-message-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(17, 138, 178, 0.16), rgba(11, 95, 125, 0.14));
      color: #0f6f90;
      font-size: 11px;
      font-weight: 800;
      flex: none;
    }
    .cbot-message-row.is-user .cbot-message-avatar {
      order: 2;
      background: linear-gradient(135deg, rgba(65, 166, 220, 0.18), rgba(108, 196, 242, 0.14));
      color: #1a6e95;
    }
    .cbot-message-row.is-system .cbot-message-avatar {
      background: rgba(242, 211, 155, 0.24);
      color: #9a6818;
    }
    .cbot-message-bubble {
      display: grid;
      gap: 6px;
      max-width: calc(100% - 40px);
    }
    .cbot-message {
      display: flex;
      flex-direction: column;
      width: fit-content;
      max-width: 100%;
      margin: 0;
      padding: 12px 14px;
      border-radius: 18px 18px 18px 8px;
      border: 1px solid #d8e4ef;
      background: rgba(255, 255, 255, 0.96);
      color: #1f3349;
      white-space: pre-wrap;
      line-height: 1.5;
      font-size: 13px;
      box-shadow: 0 12px 22px rgba(19, 43, 61, 0.06);
      text-align: left;
      align-self: flex-start;
    }
    .cbot-message.is-user {
      border-radius: 18px 18px 8px 18px;
      background: linear-gradient(180deg, #e2f5ff, #d6effd);
      border-color: #abd7ee;
    }
    .cbot-message.is-system {
      max-width: 100%;
      width: auto;
      margin-right: 0;
      border-style: dashed;
      background: #fff8ea;
      border-color: #f2d39b;
      color: #7a5822;
    }
    .cbot-message-meta {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 700;
      color: #56708a;
    }
    .cbot-message-note {
      font-size: 11px;
      line-height: 1.4;
      color: #6f8799;
      padding: 0 4px;
    }
    .cbot-message-body {
      display: grid;
      gap: 8px;
      justify-items: start;
      align-items: start;
      text-align: left;
    }
    .cbot-message-paragraph {
      margin: 0;
      width: 100%;
    }
    .cbot-chat-form,
    .cbot-contact-form {
      display: grid;
      gap: 10px;
      padding: 14px 16px 16px;
      border-top: 1px solid #edf2f7;
      background: rgba(255, 255, 255, 0.96);
    }
    .cbot-chat-form {
      grid-template-columns: 1fr auto;
      align-items: end;
      box-shadow: 0 -14px 30px rgba(19, 43, 61, 0.05);
    }
    .cbot-toolbar {
      grid-column: 1 / -1;
      display: grid;
      gap: 8px;
    }
    .cbot-input,
    .cbot-contact-form input,
    .cbot-contact-form select,
    .cbot-contact-form textarea {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #d4dce6;
      border-radius: 16px;
      padding: 12px 14px;
      font: inherit;
      background: #fff;
      color: #102132;
    }
    .cbot-input {
      min-height: 96px;
      resize: vertical;
      box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .cbot-send,
    .cbot-contact-submit {
      border: 0;
      background: linear-gradient(135deg, ${themeColor}, #0b5f7d);
      color: #fff;
      padding: 12px 16px;
      font-weight: 700;
      min-width: 84px;
    }
    .cbot-upload-btn {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 999px;
      background: #ecf5fb;
      color: #35526f;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
    }
    .cbot-file-input {
      display: none;
    }
    .cbot-attachment-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .cbot-attachment-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      border-radius: 12px;
      border: 1px solid #d7e3ef;
      background: #fff;
      font-size: 12px;
      color: #35526f;
    }
    .cbot-attachment-chip button {
      border: 0;
      background: transparent;
      color: #7a8fa3;
      cursor: pointer;
      padding: 0;
    }
    .cbot-message-attachments {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .cbot-message-attachment {
      display: block;
      width: 84px;
      height: 84px;
      overflow: hidden;
      border-radius: 12px;
      border: 1px solid #d7e3ef;
      background: #eef5fb;
    }
    .cbot-message-attachment img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }
    .cbot-contact-panel {
      display: none;
      padding: 0 16px 16px;
      border-top: 1px solid #edf2f7;
      background: #f8fbff;
      min-width: 0;
    }
    .cbot-contact-panel.is-active {
      display: block;
    }
    .cbot-contact-meta,
    .cbot-contact-notice {
      margin: 8px 0 0;
      font-size: 12px;
      line-height: 1.5;
      color: #35526f;
      white-space: pre-wrap;
    }
    .cbot-chat-status {
      min-height: 20px;
      padding: 6px 16px 10px;
      font-size: 12px;
      line-height: 1.5;
      color: #587186;
      background: rgba(255, 255, 255, 0.96);
      border-top: 1px solid rgba(237, 242, 247, 0.7);
    }
    .cbot-chat-status.is-error {
      color: #b4491f;
    }
    .cbot-send[disabled],
    .cbot-contact-submit[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    @media (max-width: 640px) {
      .cbot-root {
        right: 12px;
        left: 12px;
        bottom: 12px;
        width: auto;
      }
      .cbot-trigger {
        width: 100%;
        justify-content: center;
      }
      .cbot-panel {
        width: 100%;
        height: min(76vh, 680px);
      }
      .cbot-overview {
        grid-template-columns: 1fr;
      }
      .cbot-chat-form {
        grid-template-columns: 1fr;
      }
      .cbot-send {
        width: 100%;
      }
      .cbot-message-bubble {
        max-width: calc(100% - 8px);
      }
    }
  `

  document.head.appendChild(style)
}

function createRoot(themeColor: string, siteName: string) {
  const root = document.createElement('div')
  root.className = 'cbot-root'
  root.innerHTML = `
    <button type="button" class="cbot-trigger" aria-label="打开 AI 客服">
      <span class="cbot-trigger-badge">AI</span>
      <span class="cbot-trigger-copy">
        <span class="cbot-trigger-title">AI 客服</span>
        <span class="cbot-trigger-meta">文档答疑 / 报价 / 留资</span>
      </span>
      <span class="cbot-trigger-status">在线</span>
    </button>
    <section class="cbot-panel" aria-label="AI 客服">
      <header class="cbot-head">
        <div class="cbot-head-main">
          <span class="cbot-avatar">AI</span>
          <div>
            <p class="cbot-kicker">${siteName}</p>
            <strong>AI 客服服务台</strong>
<!--            <p class="cbot-subtitle">先回答问题，再判断价格和联系需求，减少来回确认。</p>-->
            <div class="cbot-service-line">
              <span class="cbot-service-pill">7 x 24 在线接待</span>
              <span class="cbot-service-pill">优先基于当前资料回答</span>
            </div>
          </div>
        </div>
        <button type="button" class="cbot-close" aria-label="关闭 AI 客服">×</button>
      </header>
     <!--  <section class="cbot-overview" aria-label="客服能力概览">
        <article class="cbot-overview-card is-emphasis">
          <p class="cbot-overview-label">当前站点</p>
          <p class="cbot-overview-value">${siteName}</p>
        </article>
        <article class="cbot-overview-card">
          <p class="cbot-overview-label">响应方式</p>
          <p class="cbot-overview-value">先答疑，再报价，再推进联系</p>
        </article>
        <article class="cbot-overview-card">
          <p class="cbot-overview-label">适用场景</p>
          <p class="cbot-overview-value">方案咨询、产品询价、合作留资</p>
        </article>
      </section>
     <section class="cbot-context" aria-live="polite">-->
<!--        <p class="cbot-context-label">当前模块说明</p>-->
<!--        <p class="cbot-context-copy"></p>-->
<!--      </section>-->
      <div class="cbot-templates"></div>
      <div class="cbot-chat-log"></div>
      <div class="cbot-chat-status" aria-live="polite"></div>
      <form class="cbot-chat-form">
        <textarea class="cbot-input" rows="2" placeholder="请输入问题"></textarea>
        <div class="cbot-toolbar">
          <label class="cbot-upload-btn">
            <input class="cbot-file-input" type="file" accept="image/*" multiple />
            截图附件
          </label>
          <div class="cbot-attachment-list"></div>
        </div>
        <button type="submit" class="cbot-send">发送</button>
      </form>
      <section class="cbot-contact-panel">
        <p class="cbot-contact-meta"></p>
        <form class="cbot-contact-form">
          <input name="name" type="text" maxlength="50" placeholder="姓名" required />
          <input name="company" type="text" maxlength="100" placeholder="公司" required />
          <input name="contact" type="text" maxlength="100" placeholder="手机号 / 邮箱 / 微信" required />
          <select name="demandType" required>
            <option value="汽车产件询价">汽车产件询价</option>
            <option value="机台设备询价">机台设备询价</option>
            <option value="项目合作咨询">项目合作咨询</option>
          </select>
          <textarea name="message" maxlength="300" rows="2" placeholder="补充需求（选填）"></textarea>
          <button type="submit" class="cbot-contact-submit">提交联系需求</button>
        </form>
        <p class="cbot-contact-notice"></p>
      </section>
    </section>
  `

  ensureStyle(themeColor)
  document.body.appendChild(root)
  return root
}

export function createCustomerBot(): CustomerBotInstance {
  let root: HTMLElement | null = null
  let iframeHost: ReturnType<typeof createIframeHost> | null = null
  let activeModule: AssistantModule = 'md'
  let options: CustomerBotInitOptions = {}
  let isSending = false
  const historyStore = createConversationHistoryStore()
  let tenantRuntimeConfig: RuntimeWidgetConfig | null = null
  let activeSessionId: string | null = null
  let pendingAttachments: MessageAttachment[] = []
  let initializedData: {
    knowledge: AssistantKnowledgeEntry[]
    articles: ArticleListItem[]
    products: ProductListItem[]
    consultingServices: ConsultingServiceListItem[]
    siteConfig: SiteConfig
  } | null = null

  const promptTemplates: Record<AssistantModule, Array<{ label: string; prompt: string }>> = {
    md: [
      { label: 'WMS 是什么', prompt: 'WMS 是怎样一回事？' },
      { label: '采购 AI 助手', prompt: '采购 AI 助手能解决什么问题？' },
      { label: '财税 OCR', prompt: '财税 OCR 怎么落地？' }
    ],
    price: [
      { label: '六角头螺栓', prompt: '六角头螺栓多少钱？' },
      { label: '高速螺丝机', prompt: '高速螺丝机价格是多少？' },
      { label: '咨询服务', prompt: '智能工厂诊断咨询价格是多少？' }
    ],
    contact: [
      { label: '联系方式', prompt: '请把电话和邮箱告诉我。' },
      { label: '最快沟通', prompt: '怎样最快联系到你们？' },
      { label: '提需求', prompt: '提交合作需求需要哪些信息？' }
    ]
  }

  const moduleDescriptions: Record<AssistantModule, string> = {
    md: '适合先问系统概念、落地方式、适用场景。我会尽量基于当前租户资料给你结构化回答。',
    price: '适合直接问产品或服务价格。如果资料里有命中的产品参数或咨询服务，我会优先按明确价格回答。',
    contact: '适合准备进入人工沟通阶段时使用。你可以直接拿联系方式，或提交合作需求表单。'
  }

  const moduleWelcomeCards: Record<AssistantModule, { title: string; copy: string; bullets: string[] }> = {
    md: {
      title: '先问清楚，再决定要不要继续推进',
      copy: '适合第一次接触方案时使用。你可以直接问概念、流程、适用场景或实施方式。',
      bullets: ['可先问系统是什么', '可追问落地步骤', '可结合截图或资料继续追问']
    },
    price: {
      title: '先确认名称，再返回可用价格信息',
      copy: '适合产品或服务询价。输入明确名称时，回复会更稳定；如果名称模糊，我会先帮你缩小范围。',
      bullets: ['优先输入产品名', '也可问咨询服务价格', '若资料缺失，我会提醒转人工确认']
    },
    contact: {
      title: '进入人工沟通前，把关键信息一次说清',
      copy: '适合准备推进合作时使用。你可以先拿联系方式，也可以直接提交表单，减少来回补充。',
      bullets: ['可先拿电话和邮箱', '可提交公司和需求', '适合报价、合作或项目咨询']
    }
  }

  const history: Record<AssistantModule, ConversationMessage[]> = historyStore.load()

  function persistHistory() {
    historyStore.save(history)
  }

  async function runLlmReply(module: AssistantModule, message: string, fallback: () => string): Promise<string> {
    const adapter = createLlmAdapter({
      endpoint: options.llmEndpoint,
      apiKey: options.apiKey,
      model: options.model,
      fetcher: options.fetcher,
      systemPrompt:
        options.systemPrompt ||
        '你是制造业网站的 AI 客服。你需要保持专业、可信、主动推进成交，并在合适时收集线索。',
      soulProfile: options.soulProfile || {
        role: '制造业解决方案顾问',
        tone: '专业、直接、可信、有销售推进意识',
        goals: ['快速判断用户意图', '推动咨询或留资', '回答时保持品牌人格']
      },
      fallback: async () => fallback()
    })

    const result = await adapter.reply({
      message,
      history: history[module]
        .filter((item) => item.content.trim())
        .slice(-6)
        .map((item) => ({
          role: item.role,
          content: item.content
        })),
      context: initializedData
        ? [
            `站点：${initializedData.siteConfig.brandName}`,
            `简介：${initializedData.siteConfig.about}`,
            `产品数：${initializedData.products.length}`,
            `咨询服务数：${initializedData.consultingServices.length}`
          ].join('\n')
        : ''
    })

    return result.content
  }

  function getPanel(): HTMLElement | null {
    return root?.querySelector('.cbot-panel') ?? null
  }

  function getSiteConfig(): SiteConfig {
    if (tenantRuntimeConfig) {
      return {
        brandName: tenantRuntimeConfig.brandName,
        heroTitle: demoSiteConfig.heroTitle,
        about: demoSiteConfig.about,
        phone: tenantRuntimeConfig.contactPhone,
        email: tenantRuntimeConfig.contactEmail,
        address: tenantRuntimeConfig.contactAddress
      }
    }

    const mergedContact = options.contact || {}

    return {
      ...demoSiteConfig,
      ...mergedContact,
      brandName: options.siteName || mergedContact.brandName || demoSiteConfig.brandName
    }
  }

  function getFetcher(): typeof fetch {
    return options.fetcher || fetch
  }

  async function loadTenantRuntimeConfig() {
    if (!options.tenantId) {
      return
    }

    const response = await getFetcher()(
      `${buildApiUrl('/api/embed/config', options.apiBaseUrl)}?tenantId=${encodeURIComponent(options.tenantId)}`
    )
    if (!response.ok) {
      throw new Error('Failed to load tenant config')
    }

    tenantRuntimeConfig = (await response.json()) as RuntimeWidgetConfig
  }

  function syncRuntimeConfigToDom() {
    if (!root || !tenantRuntimeConfig) {
      return
    }

    const kicker = root.querySelector('.cbot-kicker')
    if (kicker) {
      kicker.textContent = tenantRuntimeConfig.brandName
    }

    const contactMeta = root.querySelector('.cbot-contact-meta')
    if (contactMeta) {
      contactMeta.textContent = `电话：${tenantRuntimeConfig.contactPhone}\n邮箱：${tenantRuntimeConfig.contactEmail}\n地址：${tenantRuntimeConfig.contactAddress}`
    }
  }

  async function runBackendChat(message: string, attachments: MessageAttachment[] = []): Promise<string> {
    if (!options.tenantId) {
      throw new Error('tenantId is required')
    }

    const response = await getFetcher()(buildApiUrl('/api/chat', options.apiBaseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tenantId: options.tenantId,
        sessionId: activeSessionId,
        message,
        attachments
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send chat message')
    }

    const data = (await response.json()) as {
      reply: string
      sessionId?: string
    }

    activeSessionId = data.sessionId || activeSessionId
    return data.reply
  }

  async function submitTenantLead(body: {
    name: string
    company: string
    contact: string
    demandType: string
    message: string
  }): Promise<string> {
    if (!options.tenantId) {
      throw new Error('tenantId is required')
    }

    const response = await getFetcher()(buildApiUrl('/api/contact', options.apiBaseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...body,
        tenantId: options.tenantId,
        sessionId: activeSessionId
      })
    })

    if (!response.ok) {
      throw new Error('Failed to submit lead')
    }

    const data = (await response.json()) as { message?: string }
    return data.message || '提交成功，我们会尽快联系你。'
  }

  function renderTemplates() {
    const container = root?.querySelector('.cbot-templates')
    if (!container) {
      return
    }

    container.innerHTML = promptTemplates[activeModule]
      .map((item) => `<button type="button" class="cbot-template-btn" data-prompt="${item.prompt}">${item.label}</button>`)
      .join('')
  }

  function setChatStatus(message = '', type: 'default' | 'error' = 'default') {
    const status = root?.querySelector('.cbot-chat-status')
    if (!status) {
      return
    }

    status.textContent = message
    status.classList.toggle('is-error', type === 'error')
  }

  function renderModuleContext() {
    const context = root?.querySelector('.cbot-context-copy')
    if (!context) {
      return
    }

    context.textContent = moduleDescriptions[activeModule]
  }

  function renderWelcomeCard() {
    const chatLog = root?.querySelector('.cbot-chat-log')
    if (!chatLog || history[activeModule].length > 0) {
      return ''
    }

    const card = moduleWelcomeCards[activeModule]
    return `
      <section class="cbot-welcome">
        <p class="cbot-welcome-title">${card.title}</p>
        <p class="cbot-welcome-copy">${card.copy}</p>
        <ul class="cbot-welcome-list">
          ${card.bullets
            .map(
              (item, index) =>
                `<li class="cbot-welcome-item"><span class="cbot-welcome-dot">${index + 1}</span><span>${item}</span></li>`
            )
            .join('')}
        </ul>
      </section>
    `
  }

  function formatMessageContent(content: string) {
    const paragraphs = content
      .split(/\n{2,}/)
      .map((item) => item.trim())
      .filter(Boolean)

    if (!paragraphs.length) {
      return '<p class="cbot-message-paragraph"></p>'
    }

    return `<div class="cbot-message-body">${paragraphs
      .map((paragraph) => `<p class="cbot-message-paragraph">${paragraph.replace(/\n/g, '<br />')}</p>`)
      .join('')}</div>`
  }

  function setSendingState(nextState: boolean) {
    isSending = nextState

    const sendButton = root?.querySelector('.cbot-send') as HTMLButtonElement | null
    const input = root?.querySelector('.cbot-input') as HTMLTextAreaElement | null
    const fileInput = root?.querySelector('.cbot-file-input') as HTMLInputElement | null

    if (sendButton) {
      sendButton.disabled = nextState
      sendButton.textContent = nextState ? '发送中...' : '发送'
    }

    if (input) {
      input.disabled = nextState
    }

    if (fileInput) {
      fileInput.disabled = nextState
    }

    if (nextState) {
      setChatStatus('AI 正在处理你的问题...', 'default')
    }
  }

  function renderMessages() {
    const chatLog = root?.querySelector('.cbot-chat-log')
    if (!chatLog) {
      return
    }

    const messageMarkup = history[activeModule]
      .map((item) => item)
      .reduce<string[]>((accumulator, item, index) => {
        if (index === 0) {
          const welcomeCard = renderWelcomeCard()
          if (welcomeCard) {
            accumulator.push(welcomeCard)
          }
        }

        accumulator.push(`
          <div class="cbot-message-row ${item.role === 'user' ? 'is-user' : item.role === 'system' ? 'is-system' : ''}">
            <span class="cbot-message-avatar">${item.role === 'user' ? '我' : item.role === 'system' ? '!' : 'AI'}</span>
            <div class="cbot-message-bubble">
              <article class="cbot-message ${item.role === 'user' ? 'is-user' : item.role === 'system' ? 'is-system' : ''}">
                <p class="cbot-message-meta">${item.role === 'user' ? '你' : item.role === 'system' ? '系统提示' : 'AI 客服'}</p>
                ${formatMessageContent(item.content)}
                ${
                  item.attachments?.length
                    ? `<div class="cbot-message-attachments">${item.attachments
                        .map(
                          (attachment) =>
                            `<a class="cbot-message-attachment" href="${attachment.dataUrl}" target="_blank" rel="noreferrer"><img src="${attachment.dataUrl}" alt="${attachment.name}" /></a>`
                        )
                        .join('')}</div>`
                    : ''
                }
              </article>
              <div class="cbot-message-note">${item.role === 'user' ? '已发送' : item.role === 'system' ? '请处理后重试' : '基于当前资料整理回复'}</div>
            </div>
          </div>
        `)

        return accumulator
      }, [])
      .join('')

    chatLog.innerHTML = `<div class="cbot-chat-stack">${messageMarkup}</div>`

    chatLog.scrollTop = chatLog.scrollHeight
  }

  function renderActiveState() {
    const contactPanel = root?.querySelector('.cbot-contact-panel')
    contactPanel?.classList.toggle('is-active', activeModule === 'contact')
    renderModuleContext()
    renderTemplates()
    renderMessages()
  }

  function pushMessage(
    module: AssistantModule,
    role: ConversationMessage['role'],
    content: string,
    attachments?: MessageAttachment[]
  ) {
    history[module].push({
      id: `${module}-${Date.now()}-${history[module].length + 1}`,
      role,
      content,
      createdAt: Date.now(),
      attachments: attachments?.length ? structuredClone(attachments) : undefined
    })
    persistHistory()
    if (module === activeModule) {
      renderMessages()
    }
  }

  function renderPendingAttachments() {
    const container = root?.querySelector('.cbot-attachment-list')
    if (!container) {
      return
    }

    container.innerHTML = pendingAttachments
      .map(
        (attachment) =>
          `<span class="cbot-attachment-chip">${attachment.name}<button type="button" data-remove-attachment="${attachment.id}">移除</button></span>`
      )
      .join('')
  }

  function removePendingAttachment(attachmentId: string) {
    pendingAttachments = pendingAttachments.filter((item) => item.id !== attachmentId)
    renderPendingAttachments()
  }

  async function readFiles(files: FileList | null): Promise<MessageAttachment[]> {
    const inputFiles = Array.from(files || []).filter((file) => file.type.startsWith('image/'))
    return Promise.all(
      inputFiles.map(
        (file) =>
          new Promise<MessageAttachment>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                id: `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                name: file.name,
                mimeType: file.type || 'image/png',
                size: file.size,
                dataUrl: String(reader.result || '')
              })
            }
            reader.onerror = () => {
              reject(reader.error || new Error('Failed to read file'))
            }
            reader.readAsDataURL(file)
          })
      )
    )
  }

  function ensureWelcomeMessage(module: AssistantModule) {
    if (history[module].length > 0) {
      return
    }

    const welcomeMap: Record<AssistantModule, string> = {
      md: '可以直接开始提问。我会优先根据当前站点资料，整理成更容易阅读的结构化答复。',
      price: '可以直接输入产品或咨询服务名称。我会尽量返回命中的价格信息，并提醒是否需要人工继续确认。',
      contact: '可以先拿联系方式，也可以直接提交合作需求。我会引导你把必要信息一次补齐。'
    }

    pushMessage(module, 'assistant', welcomeMap[module])
  }

  function bindEvents() {
    const trigger = root?.querySelector('.cbot-trigger')
    const close = root?.querySelector('.cbot-close')
    const templateContainer = root?.querySelector('.cbot-templates')
    const chatForm = root?.querySelector('.cbot-chat-form') as HTMLFormElement | null
    const input = root?.querySelector('.cbot-input') as HTMLTextAreaElement | null
    const fileInput = root?.querySelector('.cbot-file-input') as HTMLInputElement | null
    const contactForm = root?.querySelector('.cbot-contact-form') as HTMLFormElement | null

    trigger?.addEventListener('click', () => {
      api.open()
    })

    close?.addEventListener('click', () => {
      api.close()
    })

    templateContainer?.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (!target.classList.contains('cbot-template-btn') || !input) {
        return
      }

      input.value = target.dataset.prompt || ''
      chatForm?.requestSubmit()
    })

    root?.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null
      const attachmentId = target?.getAttribute('data-remove-attachment')
      if (!attachmentId) {
        return
      }

      removePendingAttachment(attachmentId)
    })

    fileInput?.addEventListener('change', async () => {
      if (isSending) {
        return
      }

      try {
        const attachments = await readFiles(fileInput.files)
        pendingAttachments = [...pendingAttachments, ...attachments].slice(0, 4)
        renderPendingAttachments()
      } finally {
        fileInput.value = ''
      }
    })

    chatForm?.addEventListener('submit', async (event) => {
      event.preventDefault()
      if (!input || !initializedData || isSending) {
        return
      }

      const text = input.value.trim()
      if (!text) {
        return
      }

      const attachments = pendingAttachments
      pendingAttachments = []
      renderPendingAttachments()

      pushMessage(activeModule, 'user', text, attachments)
      input.value = ''
      setSendingState(true)

      try {
        if (options.tenantId) {
          const reply = await runBackendChat(text, attachments)
          pushMessage(activeModule, 'assistant', reply)
          setChatStatus('')
          return
        }

        if (activeModule === 'md') {
          const reply = await runLlmReply(activeModule, text, () =>
            buildAssistantReply({
              query: text,
              knowledgeEntries: initializedData!.knowledge,
              articles: initializedData!.articles,
              products: initializedData!.products,
              consultingServices: initializedData!.consultingServices,
              contentSources: [],
              siteConfig: initializedData!.siteConfig,
              attachments
            })
          )
          pushMessage(activeModule, 'assistant', reply)
          setChatStatus('')
          return
        }

        if (activeModule === 'price') {
          const reply = await runLlmReply(activeModule, text, () =>
            buildPriceAnswer({
              query: text,
              products: initializedData!.products,
              consultingServices: initializedData!.consultingServices
            })
          )
          pushMessage(activeModule, 'assistant', reply)
          setChatStatus('')
          return
        }

        pushMessage(
          activeModule,
          'assistant',
          `可以直接联系我：\n- 电话：${initializedData.siteConfig.phone}\n- 邮箱：${initializedData.siteConfig.email}\n- 地址：${initializedData.siteConfig.address}\n你也可以使用下方表单提交需求。`
        )
        setChatStatus('')
      } catch (error) {
        const message = error instanceof Error ? error.message : '发送失败，请稍后重试。'
        pushMessage(activeModule, 'system', `当前消息发送失败。\n${message}`)
        setChatStatus('当前消息发送失败，请检查机器人服务或稍后重试。', 'error')
      } finally {
        setSendingState(false)
      }
    })

    contactForm?.addEventListener('submit', async (event) => {
      event.preventDefault()
      if (!initializedData) {
        return
      }

      const notice = root?.querySelector('.cbot-contact-notice')
      const formData = new FormData(contactForm)
      const body = {
        name: String(formData.get('name') || ''),
        company: String(formData.get('company') || ''),
        contact: String(formData.get('contact') || ''),
        demandType: String(formData.get('demandType') || ''),
        message: String(formData.get('message') || '')
      }

      if (options.tenantId) {
        try {
          const message = await submitTenantLead(body)
          if (notice) {
            notice.textContent = message
          }
          contactForm.reset()
        } catch {
          if (notice) {
            notice.textContent = '提交失败，请稍后再试。'
          }
        }
        return
      }

      if (options.submitEndpoint) {
        try {
          const response = await fetch(options.submitEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          })
          const data = (await response.json()) as { message?: string }
          if (notice) {
            notice.textContent = data.message || '提交成功，我们会尽快联系你。'
          }
          contactForm.reset()
        } catch {
          if (notice) {
            notice.textContent = '提交失败，请稍后再试。'
          }
        }
        return
      }

      if (notice) {
        notice.textContent = '提交成功，我们会在 1 个工作日内联系你。'
      }
      contactForm.reset()
    })
  }

  const api: CustomerBotInstance = {
    init(initOptions = {}) {
      if (root || iframeHost) {
        return
      }

      options = initOptions
      if (options.mode === 'iframe') {
        iframeHost = createIframeHost()
        iframeHost.mount({
          iframeSrc: options.iframeSrc || './customer-bot-frame.html'
        })
        return
      }

      initializedData = {
        knowledge: options.knowledge || assistantKnowledgeEntries,
        articles: options.articles || demoArticles,
        products: options.products || demoProducts,
        consultingServices: options.consultingServices || demoConsultingServices,
        siteConfig: getSiteConfig()
      }
      root = createRoot(options.themeColor || '#118ab2', options.siteName || initializedData.siteConfig.brandName)
      bindEvents()
      syncRuntimeConfigToDom()
      renderPendingAttachments()
      setChatStatus('')
      const contactMeta = root.querySelector('.cbot-contact-meta')
      if (contactMeta && !tenantRuntimeConfig) {
        contactMeta.textContent = `电话：${initializedData.siteConfig.phone}\n邮箱：${initializedData.siteConfig.email}\n地址：${initializedData.siteConfig.address}`
      }
      ensureWelcomeMessage(activeModule)
      renderActiveState()
      if (options.tenantId) {
        void loadTenantRuntimeConfig().then(() => {
          initializedData = initializedData
            ? {
                ...initializedData,
                siteConfig: getSiteConfig()
              }
            : initializedData
          syncRuntimeConfigToDom()
        })
      }
    },
    open() {
      if (iframeHost) {
        return
      }
      getPanel()?.classList.add('is-open')
    },
    close() {
      if (iframeHost) {
        return
      }
      getPanel()?.classList.remove('is-open')
    },
    destroy() {
      iframeHost?.destroy()
      iframeHost = null
      pendingAttachments = []
      root?.remove()
      root = null
    }
  }

  return api
}
