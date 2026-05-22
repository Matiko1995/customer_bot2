<template>
  <main class="tenant-page">
    <header class="hero">
      <div>
        <NuxtLink to="/tenant" class="back-link">返回租户首页</NuxtLink>
        <p class="eyebrow">Agent Workspace</p>
        <h1>座席工作台</h1>
        <p class="hero-copy">查看 AI 会话、处理待接管咨询，并以人工身份持续回复当前租户客户。</p>
      </div>
      <div class="hero-stats">
        <article class="hero-stat">
          <strong>{{ filteredSessions.length }}</strong>
          <span>当前会话</span>
        </article>
        <article class="hero-stat">
          <strong>{{ pendingCount }}</strong>
          <span>待接管</span>
        </article>
        <article class="hero-stat">
          <strong>{{ humanActiveCount }}</strong>
          <span>人工中</span>
        </article>
      </div>
    </header>

    <section class="workspace-layout">
      <aside class="panel sidebar-panel">
        <header class="sidebar-head">
          <div>
            <p class="section-kicker">会话列表</p>
            <h2>客户会话</h2>
          </div>
          <button class="ghost-button" type="button" :disabled="listLoading" @click="refreshListManually">
            {{ listLoading ? '刷新中...' : '刷新列表' }}
          </button>
        </header>

        <div class="toolbar-row">
          <div class="tab-list" role="tablist" aria-label="会话筛选">
            <button
              v-for="tab in filterTabs"
              :key="tab.value"
              type="button"
              class="tab-chip"
              :class="{ active: activeFilter === tab.value }"
              @click="activeFilter = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
          <input v-model.trim="searchTerm" class="search-input" type="search" placeholder="搜索访客 / sessionId / 摘要" />
        </div>

        <p v-if="listError" class="feedback-banner error">{{ listError }}</p>

        <div v-if="listLoading && !sessions.length" class="empty-state compact">
          <h3>会话加载中</h3>
          <p>正在读取当前租户的会话列表。</p>
        </div>

        <div v-else-if="!filteredSessions.length" class="empty-state compact">
          <h3>{{ sessions.length ? '没有匹配的会话' : '当前还没有会话' }}</h3>
          <p>{{ sessions.length ? '可以调整筛选条件或搜索关键词后再试。' : '客户开始咨询后，会话会出现在这里。' }}</p>
        </div>

        <div v-else class="session-list">
          <button
            v-for="item in filteredSessions"
            :key="item.sessionId"
            type="button"
            class="session-item"
            :class="{ active: item.sessionId === activeSessionId }"
            @click="selectSession(item.sessionId)"
          >
            <div class="session-topline">
              <div>
                <strong>{{ item.visitorLabel }}</strong>
                <p>{{ item.sessionId }}</p>
              </div>
              <span class="mode-badge" :class="item.modeTone">{{ item.modeLabel }}</span>
            </div>
            <p class="session-summary">{{ item.lastMessageSummary || '暂无消息摘要' }}</p>
            <div class="session-meta">
              <span>{{ formatDate(item.lastMessageAt) }}</span>
              <span v-if="item.assignedAgentName">座席：{{ item.assignedAgentName }}</span>
            </div>
          </button>
        </div>
      </aside>

      <section class="panel detail-panel">
        <div v-if="!activeSessionId" class="empty-state detail-empty">
          <h2>选择一个会话开始处理</h2>
          <p>左侧会展示 AI 中、待接管和人工中的客户会话；选中后可在右侧查看详情并执行接管或回复操作。</p>
        </div>

        <template v-else>
          <header class="detail-head">
            <div>
              <p class="section-kicker">会话详情</p>
              <h2>{{ activeDetail?.session.id || activeSessionId }}</h2>
              <p class="detail-subtitle">
                访客：{{ activeDetailVisitorLabel }}
                <span v-if="activeDetail?.contactLabel"> · 联系方式：{{ activeDetail?.contactLabel }}</span>
              </p>
            </div>
            <div class="detail-statuses">
              <span class="mode-badge" :class="activeDetailModeTone">{{ activeDetailModeLabel }}</span>
              <span class="meta-pill">已分配：{{ activeDetailAssignedAgent }}</span>
            </div>
          </header>

          <div class="detail-meta-grid">
            <article class="meta-card">
              <span>开始时间</span>
              <strong>{{ formatDate(activeDetail?.session.startedAt) }}</strong>
            </article>
            <article class="meta-card">
              <span>最后活跃</span>
              <strong>{{ formatDate(activeDetail?.session.lastMessageAt) }}</strong>
            </article>
            <article class="meta-card">
              <span>当前模式</span>
              <strong>{{ activeDetailModeLabel }}</strong>
            </article>
          </div>

          <div class="action-row">
            <button
              v-if="canTakeover"
              type="button"
              class="primary-button"
              :disabled="actionLoading"
              @click="handleTakeover"
            >
              {{ actionLoading && actionType === 'takeover' ? '接管中...' : '接管会话' }}
            </button>
            <button
              v-if="canRelease"
              type="button"
              class="ghost-button"
              :disabled="actionLoading"
              @click="handleRelease"
            >
              {{ actionLoading && actionType === 'release' ? '恢复中...' : '恢复 AI' }}
            </button>
            <button type="button" class="ghost-button" :disabled="detailLoading" @click="refreshCurrentSession">
              {{ detailLoading ? '刷新中...' : '刷新详情' }}
            </button>
          </div>

          <p v-if="actionMessage" class="feedback-banner success">{{ actionMessage }}</p>
          <p v-if="actionError" class="feedback-banner error">{{ actionError }}</p>
          <p v-if="detailError" class="feedback-banner error">{{ detailError }}</p>

          <div class="timeline-panel">
            <div v-if="detailLoading && !activeDetail" class="empty-state compact">
              <h3>会话详情加载中</h3>
              <p>正在读取消息时间线。</p>
            </div>

            <div v-else-if="activeMessages.length" class="message-list">
              <article
                v-for="message in activeMessages"
                :key="message.id"
                class="message-card"
                :class="messageClasses(message)"
              >
                <div class="message-head">
                  <strong>{{ formatSenderLabel(message) }}</strong>
                  <span>{{ formatDate(message.createdAt) }}</span>
                </div>
                <p class="message-content">{{ message.content || '（空消息）' }}</p>

                <div v-if="message.matchedContentSources?.length" class="message-box">
                  <p class="box-title">资料引用</p>
                  <ul class="reference-list">
                    <li v-for="source in message.matchedContentSources" :key="source.id">
                      <div class="reference-head">
                        <span class="reference-type">{{ formatSourceType(source.type) }}</span>
                        <strong>{{ source.title }}</strong>
                      </div>
                      <p v-if="source.category" class="reference-meta">分类：{{ source.category }}</p>
                      <p v-if="source.snippet" class="reference-meta">摘录：{{ source.snippet }}</p>
                    </li>
                  </ul>
                </div>

                <div v-if="message.citations?.length" class="message-box">
                  <p class="box-title">检索命中</p>
                  <ul class="reference-list">
                    <li v-for="citation in message.citations" :key="citation.chunkId">
                      <div class="reference-head">
                        <span class="reference-type">{{ citation.score }}</span>
                        <strong>{{ citation.title }}</strong>
                      </div>
                      <p class="reference-meta">摘录：{{ citation.snippet }}</p>
                      <p v-if="citation.sourceUri" class="reference-meta">来源：{{ citation.sourceUri }}</p>
                    </li>
                  </ul>
                </div>

                <div v-if="message.attachments?.length" class="message-box">
                  <p class="box-title">附件</p>
                  <div class="attachment-grid">
                    <a
                      v-for="attachment in message.attachments"
                      :key="attachment.id"
                      :href="attachment.dataUrl"
                      target="_blank"
                      rel="noreferrer"
                      class="attachment-card"
                    >
                      <img :src="attachment.dataUrl" :alt="attachment.name" />
                      <span>{{ attachment.name }}</span>
                    </a>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="empty-state compact">
              <h3>暂无消息</h3>
              <p>该会话当前还没有可展示的消息时间线。</p>
            </div>
          </div>

          <form class="composer-panel" @submit.prevent="handleReply">
            <div class="composer-head">
              <div>
                <p class="section-kicker">人工回复</p>
                <h3>发送消息给客户</h3>
              </div>
              <span class="composer-hint">{{ canReply ? '当前可直接人工回复' : '请先接管会话后再回复' }}</span>
            </div>
            <textarea
              v-model="replyText"
              :disabled="!canReply || actionLoading"
              rows="4"
              maxlength="2000"
              placeholder="输入人工回复内容"
            />
            <div class="composer-actions">
              <span class="composer-count">{{ replyText.length }}/2000</span>
              <button type="submit" class="primary-button" :disabled="!canReply || actionLoading || !replyText.trim()">
                {{ actionLoading && actionType === 'reply' ? '发送中...' : '发送人工回复' }}
              </button>
            </div>
          </form>
        </template>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { ChatMessageRecord, ChatSessionRecord } from '../../types'

type ConversationMode = ChatSessionRecord['conversationMode'] | 'ended' | undefined

type SenderType = NonNullable<ChatMessageRecord['senderType']> | 'unknown'

interface ChatAvailableActions {
  canTakeover?: boolean
  canReply?: boolean
  canRelease?: boolean
}

interface ChatListResponseItem {
  session?: ChatSessionRecord
  messages?: ChatMessageRecord[]
  sessionId?: string
  visitorId?: string
  visitorName?: string
  customerName?: string
  contact?: string
  contactLabel?: string
  lastMessagePreview?: string
  lastMessageSummary?: string
  lastMessageAt?: number
  conversationMode?: ConversationMode
  assignedAgentName?: string
  assignedTenantUserName?: string
  availableActions?: ChatAvailableActions | string[]
  canReply?: boolean
}

interface ChatListItemView {
  sessionId: string
  visitorId: string
  visitorLabel: string
  contactLabel: string
  lastMessageSummary: string
  lastMessageAt?: number
  startedAt?: number
  conversationMode: ConversationMode
  modeLabel: string
  modeTone: string
  assignedAgentName: string
  availableActions: ChatAvailableActions
  canReply: boolean
  fallbackMessages?: ChatMessageRecord[]
  session?: ChatSessionRecord
}

interface ChatDetailResponse {
  session?: ChatSessionRecord
  messages?: ChatMessageRecord[]
  visitorName?: string
  customerName?: string
  contact?: string
  contactLabel?: string
  assignedAgent?: {
    id?: string
    name?: string
  } | null
  assignedAgentName?: string
  availableActions?: ChatAvailableActions | string[]
  canReply?: boolean
}

interface ChatDetailView {
  session: ChatSessionRecord
  messages: ChatMessageRecord[]
  visitorLabel: string
  contactLabel: string
  assignedAgentName: string
  availableActions: ChatAvailableActions
  canReply: boolean
}

const { request } = useTenantApi()
const sessions = ref<ChatListItemView[]>([])
const activeSessionId = ref('')
const activeDetail = ref<ChatDetailView | null>(null)
const listLoading = ref(false)
const detailLoading = ref(false)
const actionLoading = ref(false)
const actionType = ref<'takeover' | 'release' | 'reply' | ''>('')
const listError = ref('')
const detailError = ref('')
const actionError = ref('')
const actionMessage = ref('')
const replyText = ref('')
const activeFilter = ref<'all' | 'pending' | 'ai' | 'human'>('all')
const searchTerm = ref('')
let detailRequestSequence = 0

const filterTabs = [
  { label: '全部', value: 'all' as const },
  { label: '待接管', value: 'pending' as const },
  { label: 'AI 中', value: 'ai' as const },
  { label: '人工中', value: 'human' as const }
]

const pendingCount = computed(() => sessions.value.filter((item) => item.conversationMode === 'handover_requested').length)
const humanActiveCount = computed(() => sessions.value.filter((item) => item.conversationMode === 'human_active').length)

const filteredSessions = computed(() => {
  const keyword = searchTerm.value.trim().toLowerCase()

  return sessions.value.filter((item) => {
    if (activeFilter.value === 'pending' && item.conversationMode !== 'handover_requested') return false
    if (activeFilter.value === 'ai' && item.conversationMode !== 'ai_active') return false
    if (activeFilter.value === 'human' && item.conversationMode !== 'human_active') return false

    if (!keyword) return true

    return [item.sessionId, item.visitorId, item.visitorLabel, item.lastMessageSummary, item.assignedAgentName, item.contactLabel]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(keyword))
  })
})

const activeMessages = computed(() => activeDetail.value?.messages || [])
const activeDetailMode = computed<ConversationMode>(() => activeDetail.value?.session.conversationMode)
const activeDetailModeLabel = computed(() => formatMode(activeDetailMode.value).label)
const activeDetailModeTone = computed(() => formatMode(activeDetailMode.value).tone)
const activeDetailAssignedAgent = computed(() => activeDetail.value?.assignedAgentName || '未分配')
const activeDetailVisitorLabel = computed(() => activeDetail.value?.visitorLabel || '未识别访客')
const availableActions = computed<ChatAvailableActions>(() => activeDetail.value?.availableActions || {})
const canTakeover = computed(() => Boolean(availableActions.value.canTakeover))
const canRelease = computed(() => Boolean(availableActions.value.canRelease))
const canReply = computed(() => Boolean(activeDetail.value?.canReply || availableActions.value.canReply))

function formatDate(value?: number) {
  if (!value) return '--'
  return new Date(value).toLocaleString()
}

function formatMode(mode: ConversationMode) {
  switch (mode) {
    case 'handover_requested':
      return { label: '待接管', tone: 'pending' }
    case 'human_active':
      return { label: '人工中', tone: 'human' }
    case 'ai_active':
      return { label: 'AI 中', tone: 'ai' }
    case 'ended':
      return { label: '已结束', tone: 'ended' }
    default:
      return { label: '未知', tone: 'default' }
  }
}

function formatSourceType(type?: string) {
  const labels: Record<string, string> = {
    document: '文档',
    webpage: '网页',
    email: '邮件',
    excel: '表格',
    manual: '手动录入'
  }

  return labels[type || ''] || type || '资料'
}

function getVisitorLabel(source: { visitorName?: string; customerName?: string; visitorId?: string; session?: ChatSessionRecord }) {
  return source.customerName || source.visitorName || source.session?.visitorId || source.visitorId || '未命名访客'
}

function normalizeAvailableActions(value?: ChatAvailableActions | string[]) {
  if (Array.isArray(value)) {
    const actionSet = new Set(value.filter(Boolean))
    return {
      canTakeover: actionSet.has('takeover'),
      canReply: actionSet.has('reply'),
      canRelease: actionSet.has('release')
    }
  }

  if (value && typeof value === 'object') {
    return {
      canTakeover: Boolean(value.canTakeover),
      canReply: Boolean(value.canReply),
      canRelease: Boolean(value.canRelease)
    }
  }

  return {
    canTakeover: false,
    canReply: false,
    canRelease: false
  }
}

function normalizeListItem(item: ChatListResponseItem): ChatListItemView | null {
  const session = item.session
  const sessionId = item.sessionId || session?.id

  if (!sessionId) return null

  const lastMessageAt = item.lastMessageAt || session?.lastMessageAt
  const conversationMode = item.conversationMode || session?.conversationMode
  const lastMessage = item.messages?.[item.messages.length - 1]
  const lastMessageSummary = item.lastMessagePreview || item.lastMessageSummary || lastMessage?.content || ''
  const assignedAgentName = item.assignedAgentName || item.assignedTenantUserName || session?.assignedTenantUserName || ''
  const availableActions = normalizeAvailableActions(item.availableActions)
  const canReply = Boolean(item.canReply ?? availableActions.canReply)
  const modeMeta = formatMode(conversationMode)

  return {
    sessionId,
    visitorId: item.visitorId || session?.visitorId || '',
    visitorLabel: getVisitorLabel(item),
    contactLabel: item.contactLabel || item.contact || '',
    lastMessageSummary,
    lastMessageAt,
    startedAt: session?.startedAt,
    conversationMode,
    modeLabel: modeMeta.label,
    modeTone: modeMeta.tone,
    assignedAgentName,
    availableActions,
    canReply,
    fallbackMessages: item.messages,
    session
  }
}

function buildFallbackDetailFromList(item: ChatListItemView): ChatDetailView {
  const session = item.session || {
    id: item.sessionId,
    tenantId: '',
    visitorId: item.visitorId,
    startedAt: item.startedAt || item.lastMessageAt || Date.now(),
    lastMessageAt: item.lastMessageAt || Date.now(),
    conversationMode: item.conversationMode,
    assignedTenantUserName: item.assignedAgentName || undefined
  }

  return {
    session,
    messages: item.fallbackMessages || [],
    visitorLabel: item.visitorLabel,
    contactLabel: item.contactLabel,
    assignedAgentName: item.assignedAgentName,
    availableActions: item.availableActions,
    canReply: item.canReply
  }
}

function normalizeDetail(detail: ChatDetailResponse, sessionId: string): ChatDetailView {
  const session = detail.session || {
    id: sessionId,
    tenantId: '',
    visitorId: '',
    startedAt: Date.now(),
    lastMessageAt: Date.now(),
    conversationMode: undefined
  }

  return {
    session,
    messages: Array.isArray(detail.messages) ? detail.messages : [],
    visitorLabel: getVisitorLabel({ ...detail, session }),
    contactLabel: detail.contactLabel || detail.contact || '',
    assignedAgentName: detail.assignedAgent?.name || detail.assignedAgentName || session.assignedTenantUserName || '',
    availableActions: normalizeAvailableActions(detail.availableActions),
    canReply: Boolean(detail.canReply)
  }
}

function resolveSenderType(message: ChatMessageRecord): SenderType {
  if (message.senderType) return message.senderType
  if (message.role === 'user') return 'customer'
  if (message.role === 'assistant') return 'ai'
  if (message.role === 'system') return 'system'
  return 'unknown'
}

function isRightAligned(message: ChatMessageRecord) {
  const senderType = resolveSenderType(message)
  return senderType === 'ai' || senderType === 'agent'
}

function messageClasses(message: ChatMessageRecord) {
  const senderType = resolveSenderType(message)
  return [`sender-${senderType}`, { 'align-right': isRightAligned(message), system: senderType === 'system' }]
}

function formatSenderLabel(message: ChatMessageRecord) {
  const senderType = resolveSenderType(message)

  switch (senderType) {
    case 'customer':
      return '客户'
    case 'ai':
      return 'AI 客服'
    case 'agent':
      return `人工客服${message.senderName ? ` ${message.senderName}` : ''}`
    case 'system':
      return '系统'
    default:
      return message.senderName || message.role || '消息'
  }
}

function pickDefaultSessionId(items: ChatListItemView[]) {
  if (!items.length) return ''
  return items.find((item) => item.conversationMode === 'handover_requested')?.sessionId || items[0]?.sessionId || ''
}

async function loadChats(options: { preserveSelection?: boolean } = {}) {
  listLoading.value = true
  listError.value = ''

  try {
    const response = await request<{ items?: ChatListResponseItem[] }>('/api/tenant/chats')
    const nextItems = Array.isArray(response.items)
      ? response.items.map(normalizeListItem).filter((item): item is ChatListItemView => Boolean(item))
      : []

    nextItems.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
    sessions.value = nextItems

    const hasActive = options.preserveSelection && activeSessionId.value && nextItems.some((item) => item.sessionId === activeSessionId.value)
    if (!hasActive) {
      activeSessionId.value = pickDefaultSessionId(nextItems)
    }

    if (!activeSessionId.value) {
      detailRequestSequence += 1
      activeDetail.value = null
      detailLoading.value = false
    }
  } catch (error: any) {
    if (error?.statusCode === 401) {
      await navigateTo('/tenant/login')
      return
    }

    listError.value = error?.statusMessage || '会话列表加载失败，请稍后再试。'
  } finally {
    listLoading.value = false
  }
}

async function loadDetail(sessionId: string) {
  if (!sessionId) return

  const requestId = ++detailRequestSequence
  detailLoading.value = true
  detailError.value = ''
  actionMessage.value = ''

  try {
    const response = await request<ChatDetailResponse>(`/api/tenant/chats/${encodeURIComponent(sessionId)}`)
    if (requestId !== detailRequestSequence || activeSessionId.value !== sessionId) return
    activeDetail.value = normalizeDetail(response, sessionId)
  } catch (error: any) {
    if (requestId !== detailRequestSequence || activeSessionId.value !== sessionId) return
    if (error?.statusCode === 401) {
      await navigateTo('/tenant/login')
      return
    }

    const fallback = sessions.value.find((item) => item.sessionId === sessionId)
    if (fallback) {
      activeDetail.value = buildFallbackDetailFromList(fallback)
      detailError.value = '详情接口暂不可用，已展示列表中的基础消息数据。'
    } else {
      activeDetail.value = null
      detailError.value = error?.statusMessage || '会话详情加载失败，请稍后再试。'
    }
  } finally {
    if (requestId !== detailRequestSequence || activeSessionId.value !== sessionId) return
    detailLoading.value = false
  }
}

async function selectSession(sessionId: string) {
  if (!sessionId) return
  activeSessionId.value = sessionId
  replyText.value = ''
  const fallback = sessions.value.find((item) => item.sessionId === sessionId)
  if (fallback) {
    activeDetail.value = buildFallbackDetailFromList(fallback)
  }
  await loadDetail(sessionId)
}

async function refreshListManually() {
  await loadChats({ preserveSelection: true })

  if (activeSessionId.value) {
    await loadDetail(activeSessionId.value)
  }
}

async function refreshCurrentSession() {
  if (!activeSessionId.value) return
  await loadChats({ preserveSelection: true })
  await loadDetail(activeSessionId.value)
}

async function postSessionAction(action: 'takeover' | 'release' | 'reply', body?: Record<string, unknown>) {
  if (!activeSessionId.value) return false

  actionLoading.value = true
  actionType.value = action
  actionError.value = ''
  actionMessage.value = ''

  try {
    await request(`/api/tenant/chats/${encodeURIComponent(activeSessionId.value)}/${action}`, {
      method: 'POST',
      body
    })

    if (action === 'reply') {
      replyText.value = ''
    }

    await loadChats({ preserveSelection: true })
    await loadDetail(activeSessionId.value)
    actionMessage.value = action === 'takeover'
      ? '已成功接管当前会话。'
      : action === 'release'
        ? '已恢复 AI 接待模式。'
        : '人工回复已发送。'
    return true
  } catch (error: any) {
    if (error?.statusCode === 401) {
      await navigateTo('/tenant/login')
      return false
    }

    actionError.value = error?.statusMessage || '操作失败，请稍后再试。'
    return false
  } finally {
    actionLoading.value = false
    actionType.value = ''
  }
}

async function handleTakeover() {
  await postSessionAction('takeover')
}

async function handleRelease() {
  await postSessionAction('release')
}

async function handleReply() {
  const content = replyText.value.trim()
  if (!content || !canReply.value) return
  await postSessionAction('reply', { content })
}

await loadChats()

if (activeSessionId.value) {
  await loadDetail(activeSessionId.value)
}

let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshTimer = window.setInterval(async () => {
    await loadChats({ preserveSelection: true })
    if (activeSessionId.value) {
      await loadDetail(activeSessionId.value)
    }
  }, 10000)
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.tenant-page {
  min-height: 100vh;
  padding: 24px;
  display: grid;
  gap: 20px;
  background: linear-gradient(180deg, #f4f8fb 0%, #eef4f7 100%);
}

.hero,
.panel,
.hero-stat,
.meta-card,
.session-item,
.message-card,
.message-box,
.attachment-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #d9e6ed;
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(36, 76, 96, 0.08);
}

.hero,
.panel {
  padding: 22px;
}

.back-link {
  display: inline-flex;
  margin-bottom: 14px;
  color: #0c607b;
  text-decoration: none;
  font-weight: 700;
}

.eyebrow,
.section-kicker {
  margin: 0;
  color: #0c607b;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 12px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
}

.hero h1,
.sidebar-head h2,
.detail-head h2,
.empty-state h2,
.empty-state h3,
.composer-head h3 {
  margin: 6px 0 0;
  color: #17394f;
}

.hero-copy,
.detail-subtitle,
.empty-state p,
.session-summary,
.session-topline p,
.session-meta,
.composer-hint,
.reference-meta,
.feedback-banner {
  margin: 0;
  color: #5c7485;
  line-height: 1.7;
}

.hero-copy {
  margin-top: 8px;
  max-width: 760px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(110px, 1fr));
  gap: 12px;
  min-width: min(100%, 390px);
}

.hero-stat {
  padding: 18px;
  text-align: center;
}

.hero-stat strong {
  display: block;
  font-size: 32px;
  color: #0c607b;
}

.hero-stat span,
.meta-card span,
.session-topline p,
.session-meta,
.message-head span,
.attachment-card span,
.composer-count {
  color: #5c7485;
  font-size: 13px;
}

.workspace-layout {
  display: grid;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.sidebar-panel,
.detail-panel {
  min-height: 720px;
}

.sidebar-panel {
  display: grid;
  gap: 16px;
  align-content: start;
}

.sidebar-head,
.detail-head,
.composer-head,
.action-row,
.toolbar-row,
.session-topline,
.session-meta,
.message-head,
.reference-head,
.composer-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.sidebar-head,
.detail-head,
.toolbar-row,
.composer-head {
  align-items: center;
}

.tab-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-chip,
.ghost-button,
.primary-button,
.session-item {
  transition: 0.18s ease;
}

.tab-chip,
.ghost-button,
.primary-button {
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  border: 1px solid #d1e1ea;
  cursor: pointer;
}

.tab-chip,
.ghost-button {
  background: #fff;
  color: #315063;
}

.tab-chip.active,
.primary-button {
  background: linear-gradient(180deg, #0a7ea4 0%, #0c607b 100%);
  color: #fff;
  border-color: transparent;
}

.tab-chip:disabled,
.ghost-button:disabled,
.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-input,
textarea {
  width: 100%;
  border: 1px solid #d7e5ed;
  border-radius: 16px;
  padding: 12px 14px;
  background: #fff;
  color: #17394f;
  font: inherit;
  box-sizing: border-box;
}

.search-input {
  max-width: 220px;
}

.session-list,
.message-list {
  display: grid;
  gap: 12px;
}

.session-item {
  width: 100%;
  text-align: left;
  padding: 16px;
  cursor: pointer;
}

.session-item.active {
  border-color: #0c607b;
  box-shadow: 0 16px 36px rgba(12, 96, 123, 0.14);
  background: linear-gradient(180deg, #f6fbfd 0%, #eff7fa 100%);
}

.session-topline strong,
.message-head strong,
.reference-head strong,
.meta-card strong {
  color: #17394f;
}

.session-summary {
  margin-top: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.session-meta {
  margin-top: 10px;
  flex-wrap: wrap;
}

.mode-badge,
.meta-pill,
.reference-type {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 800;
}

.mode-badge.pending {
  background: #fff3e6;
  color: #b45309;
}

.mode-badge.human {
  background: #e9f9ef;
  color: #166534;
}

.mode-badge.ai {
  background: #eaf4ff;
  color: #1d4ed8;
}

.mode-badge.ended,
.mode-badge.default,
.meta-pill,
.reference-type {
  background: #f2f6f8;
  color: #4d6778;
}

.detail-panel {
  display: grid;
  gap: 18px;
  align-content: start;
}

.detail-statuses {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.detail-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.meta-card {
  padding: 16px;
}

.meta-card strong {
  display: block;
  margin-top: 8px;
  font-size: 16px;
}

.action-row {
  flex-wrap: wrap;
}

.feedback-banner {
  border-radius: 16px;
  padding: 12px 14px;
  border: 1px solid #d9e6ed;
}

.feedback-banner.success {
  background: #edf9f2;
  border-color: #bde3ca;
  color: #166534;
}

.feedback-banner.error {
  background: #fff3f2;
  border-color: #f2c7c1;
  color: #b42318;
}

.timeline-panel,
.composer-panel {
  display: grid;
  gap: 14px;
}

.message-card {
  padding: 16px;
  max-width: min(88%, 760px);
}

.message-card.align-right {
  margin-left: auto;
}

.message-card.system {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  background: #f6f8fa;
}

.sender-customer {
  background: #f8fcfd;
  border-color: #d6e8ee;
}

.sender-ai {
  background: #f7f9fd;
  border-color: #dce5f4;
}

.sender-agent {
  background: #f2fbf5;
  border-color: #cae8d4;
}

.sender-system {
  background: #f6f8fa;
  border-color: #e2e8f0;
}

.message-head {
  align-items: center;
}

.message-content {
  margin: 10px 0 0;
  color: #365062;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 18px;
  background: #fff;
}

.box-title {
  margin: 0;
  color: #17394f;
  font-weight: 800;
}

.reference-list {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.reference-list li + li {
  padding-top: 10px;
  border-top: 1px solid #edf3f7;
}

.attachment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.attachment-card {
  display: grid;
  gap: 8px;
  text-decoration: none;
  color: #17394f;
  padding: 10px;
}

.attachment-card img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #dbe7ef;
  background: #f3f7fa;
}

.composer-panel textarea {
  min-height: 120px;
  resize: vertical;
}

.composer-hint {
  text-align: right;
}

.empty-state {
  min-height: 260px;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 8px;
}

.empty-state.compact {
  min-height: 180px;
}

.detail-empty {
  min-height: 620px;
}

@media (max-width: 1080px) {
  .workspace-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-panel,
  .detail-panel,
  .detail-empty {
    min-height: auto;
  }

  .detail-meta-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .hero,
  .toolbar-row,
  .sidebar-head,
  .detail-head,
  .composer-head {
    display: grid;
    justify-content: stretch;
  }

  .hero-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    min-width: 0;
  }

  .search-input,
  .message-card {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .tenant-page {
    padding: 16px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .session-topline,
  .session-meta,
  .message-head,
  .reference-head,
  .composer-actions,
  .action-row {
    display: grid;
  }

  .detail-statuses {
    justify-content: flex-start;
  }
}
</style>
