<template>
  <div class="ai-support-root">
    <button v-if="!open" class="ai-trigger" type="button" @click="openAssistant">
      <span>AI 客服</span>
      <small>文档 / 价格 / 联系</small>
    </button>

    <section v-else class="ai-panel" role="dialog" aria-label="AI 客服">
      <header class="ai-head">
        <div>
          <p class="ai-kicker">Customer Bot</p>
          <h3>AI 客服</h3>
        </div>
        <button class="ai-close" type="button" aria-label="关闭 AI 客服" @click="open = false">收起</button>
      </header>

      <nav class="ai-modules" aria-label="客服模块">
        <button
          v-for="module in modules"
          :key="module.id"
          type="button"
          class="ai-module-btn"
          :class="{ active: activeModule === module.id }"
          @click="switchModule(module.id)"
        >
          {{ module.label }}
        </button>
      </nav>

      <div class="ai-template-bar">
        <button
          v-for="template in currentPromptTemplates"
          :key="`${activeModule}-${template.label}`"
          type="button"
          class="ai-template-btn"
          :disabled="sending"
          @click="applyPromptTemplate(template.prompt)"
        >
          {{ template.label }}
        </button>
      </div>

      <div ref="chatLogRef" class="ai-chat-log">
        <article
          v-for="message in activeMessages"
          :key="message.id"
          class="ai-message"
          :class="{ 'is-user': message.role === 'user' }"
        >
          <p class="ai-message-meta">{{ message.role === 'user' ? '你' : '客服' }}</p>
          <p class="ai-message-text">{{ message.content }}</p>
        </article>
      </div>

      <form class="ai-chat-form" @submit.prevent="sendMessage">
        <textarea
          v-model.trim="draft"
          class="ai-input"
          :placeholder="currentModule?.placeholder || '请输入问题'"
          :disabled="sending"
          rows="2"
        />
        <button class="ai-send" type="submit" :disabled="sending || !draft">
          {{ sending ? '处理中...' : '发送' }}
        </button>
      </form>

      <section v-if="activeModule === 'contact'" class="ai-contact-panel">
        <p class="ai-contact-title">直接联系我</p>
        <p class="ai-contact-meta">电话：{{ demoSiteConfig.phone }}</p>
        <p class="ai-contact-meta">邮箱：{{ demoSiteConfig.email }}</p>
        <p class="ai-contact-meta">地址：{{ demoSiteConfig.address }}</p>

        <form class="ai-quick-form" @submit.prevent="submitContact">
          <input v-model.trim="contactForm.name" type="text" maxlength="50" placeholder="姓名" required />
          <input v-model.trim="contactForm.company" type="text" maxlength="100" placeholder="公司" required />
          <input v-model.trim="contactForm.contact" type="text" maxlength="100" placeholder="手机号 / 邮箱 / 微信" required />
          <select v-model="contactForm.demandType" required>
            <option value="汽车产件询价">汽车产件询价</option>
            <option value="机台设备询价">机台设备询价</option>
            <option value="项目合作咨询">项目合作咨询</option>
          </select>
          <textarea v-model.trim="contactForm.message" maxlength="300" rows="2" placeholder="补充需求（选填）" />
          <button type="submit" :disabled="contactSubmitting">
            {{ contactSubmitting ? '提交中...' : '提交联系需求' }}
          </button>
        </form>
        <p v-if="contactNotice" class="ai-contact-notice">{{ contactNotice }}</p>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { AssistantKnowledgeEntry, AssistantModuleId, ConversationMessage } from '../types'
import { assistantKnowledgeEntries } from '../config/ai-assistant-knowledge'
import { demoArticles, demoConsultingServices, demoProducts, demoSiteConfig } from '../config/customer-bot-data'
import { buildDocumentAnswer, buildPriceAnswer } from '../lib/customer-bot'
import { createConversationHistoryStore } from '../src/chat-history'

type AssistantModule = AssistantModuleId

interface PromptTemplate {
  label: string
  prompt: string
}

const knowledgeEntries: AssistantKnowledgeEntry[] = assistantKnowledgeEntries
const historyStore = createConversationHistoryStore()

const modules: Array<{
  id: AssistantModule
  label: string
  placeholder: string
  welcome: string
}> = [
  {
    id: 'md',
    label: '文档问答',
    placeholder: '例如：采购 AI 助手能解决哪些问题？',
    welcome: '输入问题后，我会依据本地知识条目和示例资料给出结构化答复。'
  },
  {
    id: 'price',
    label: '价格查询',
    placeholder: '例如：六角头螺栓多少钱？',
    welcome: '输入产品或咨询服务名称，我会返回本地演示价格。'
  },
  {
    id: 'contact',
    label: '直接联系',
    placeholder: '例如：怎么最快联系你们？',
    welcome: '可以直接问联系方式，也可用下方表单提交需求。'
  }
]

const modulePromptTemplates: Record<AssistantModule, PromptTemplate[]> = {
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
    { label: '获取联系方式', prompt: '请把电话和邮箱告诉我。' },
    { label: '沟通方式', prompt: '怎样最快联系到你们？' },
    { label: '提交需求', prompt: '提交合作需求需要哪些信息？' }
  ]
}

const open = ref(false)
const activeModule = ref<AssistantModule>('md')
const draft = ref('')
const sending = ref(false)
const chatLogRef = ref<HTMLElement | null>(null)
const contactSubmitting = ref(false)
const contactNotice = ref('')

const contactForm = reactive({
  name: '',
  company: '',
  demandType: '项目合作咨询',
  contact: '',
  message: ''
})

const storedHistories = historyStore.load()
const histories: Record<AssistantModule, ConversationMessage[]> = reactive(storedHistories)

const currentModule = computed(() => modules.find((item) => item.id === activeModule.value))
const activeMessages = computed(() => histories[activeModule.value])
const currentPromptTemplates = computed(() => modulePromptTemplates[activeModule.value] || [])

let messageSeq = 0

function nextMessageId(moduleId: AssistantModule): string {
  messageSeq += 1
  return `${moduleId}-${Date.now()}-${messageSeq}`
}

function persistHistories() {
  historyStore.save(histories)
}

function pushMessage(moduleId: AssistantModule, role: ConversationMessage['role'], content: string) {
  histories[moduleId].push({
    id: nextMessageId(moduleId),
    role,
    content,
    createdAt: Date.now()
  })
  persistHistories()
}

function ensureWelcomeMessage(moduleId: AssistantModule) {
  if (histories[moduleId].length > 0) {
    return
  }

  const module = modules.find((item) => item.id === moduleId)
  if (module) {
    pushMessage(moduleId, 'assistant', module.welcome)
  }
}

async function scrollToBottom() {
  await nextTick()
  if (chatLogRef.value) {
    chatLogRef.value.scrollTop = chatLogRef.value.scrollHeight
  }
}

function openAssistant() {
  open.value = true
}

function switchModule(moduleId: AssistantModule) {
  activeModule.value = moduleId
}

function applyPromptTemplate(prompt: string) {
  if (sending.value) {
    return
  }

  draft.value = prompt
  void sendMessage()
}

async function sendMessage() {
  const text = draft.value.trim()
  if (!text || sending.value) {
    return
  }

  const moduleId = activeModule.value
  pushMessage(moduleId, 'user', text)
  draft.value = ''
  sending.value = true

  try {
    if (moduleId === 'md') {
      pushMessage(
        moduleId,
        'assistant',
        buildDocumentAnswer({
          query: text,
          knowledgeEntries,
          articles: demoArticles,
          products: demoProducts,
          consultingServices: demoConsultingServices,
          contentSources: [],
          siteConfig: demoSiteConfig
        })
      )
      return
    }

    if (moduleId === 'price') {
      pushMessage(
        moduleId,
        'assistant',
        buildPriceAnswer({
          query: text,
          products: demoProducts,
          consultingServices: demoConsultingServices
        })
      )
      return
    }

    pushMessage(
      moduleId,
      'assistant',
      `可以直接联系我：\n- 电话：${demoSiteConfig.phone}\n- 邮箱：${demoSiteConfig.email}\n- 地址：${demoSiteConfig.address}\n你也可以使用下方表单提交需求。`
    )
  } finally {
    sending.value = false
    await scrollToBottom()
  }
}

async function submitContact() {
  if (contactSubmitting.value) {
    return
  }

  contactSubmitting.value = true
  contactNotice.value = ''

  try {
    const response = await $fetch<{ message: string }>('/api/contact', {
      method: 'POST',
      body: { ...contactForm }
    })

    contactNotice.value = response.message
    contactForm.name = ''
    contactForm.company = ''
    contactForm.contact = ''
    contactForm.message = ''
    contactForm.demandType = '项目合作咨询'
  } catch (error) {
    contactNotice.value = error instanceof Error ? error.message : '提交失败，请稍后再试。'
  } finally {
    contactSubmitting.value = false
  }
}

watch(open, async (isOpen) => {
  if (!isOpen) {
    return
  }

  ensureWelcomeMessage(activeModule.value)
  await scrollToBottom()
})

watch(activeModule, async (moduleId) => {
  ensureWelcomeMessage(moduleId)
  await scrollToBottom()
})
</script>

<style scoped>
.ai-support-root {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 70;
}

.ai-trigger {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  padding: 0.8rem 1rem;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(120deg, #005f99, #118ab2);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(0, 95, 153, 0.28);
  font-weight: 700;
}

.ai-trigger small {
  font-size: 0.72rem;
  font-weight: 500;
  opacity: 0.9;
}

.ai-panel {
  width: min(430px, calc(100vw - 1.2rem));
  height: min(78vh, 760px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid #d7e2ec;
  background: #fff;
  box-shadow: 0 20px 52px rgba(20, 33, 61, 0.2);
  overflow: hidden;
}

.ai-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.85rem 0.95rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(140deg, #f7fbff, #eef6ff);
}

.ai-kicker {
  margin: 0 0 0.15rem;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0a4c79;
}

.ai-head h3 {
  margin: 0;
  font-size: 1rem;
}

.ai-close {
  border: 0;
  border-radius: 10px;
  background: rgba(0, 95, 153, 0.1);
  color: #0a4c79;
  padding: 0.38rem 0.62rem;
  font-size: 0.84rem;
  cursor: pointer;
}

.ai-modules {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.35rem;
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid #edf2f7;
}

.ai-module-btn {
  border: 1px solid #d7e3ef;
  background: #f7fbff;
  color: #35526f;
  border-radius: 999px;
  padding: 0.38rem 0.55rem;
  font-size: 0.78rem;
  cursor: pointer;
}

.ai-module-btn.active {
  border-color: transparent;
  color: #fff;
  background: linear-gradient(120deg, #005f99, #118ab2);
}

.ai-template-bar {
  display: flex;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  overflow-x: auto;
  border-bottom: 1px solid #edf2f7;
  background: #f9fbff;
}

.ai-template-btn {
  border: 1px solid #d7e3ef;
  background: #fff;
  color: #35526f;
  border-radius: 999px;
  padding: 0.3rem 0.6rem;
  font-size: 0.74rem;
  white-space: nowrap;
  cursor: pointer;
}

.ai-chat-log {
  flex: 1;
  min-height: 120px;
  overflow: auto;
  padding: 0.75rem 0.85rem;
  background: linear-gradient(180deg, #f9fcff, #fdfefe);
}

.ai-message {
  max-width: 92%;
  margin-bottom: 0.65rem;
  padding: 0.58rem 0.7rem;
  border-radius: 12px;
  border: 1px solid #d8e4ef;
  background: #fff;
}

.ai-message.is-user {
  margin-left: auto;
  border-color: #9ed0ee;
  background: #edf8ff;
}

.ai-message-meta {
  margin: 0 0 0.2rem;
  font-size: 0.72rem;
  color: #56708a;
}

.ai-message-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.86rem;
  line-height: 1.5;
  color: #1f3349;
}

.ai-chat-form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  padding: 0.7rem 0.8rem;
  border-top: 1px solid #edf2f7;
  background: #fff;
}

.ai-input {
  resize: none;
  border: 1px solid #d4dce6;
  border-radius: 10px;
  padding: 0.55rem 0.65rem;
  font-size: 0.85rem;
  font-family: inherit;
}

.ai-send {
  border: 0;
  border-radius: 10px;
  background: linear-gradient(120deg, #005f99, #118ab2);
  color: #fff;
  padding: 0.55rem 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.ai-contact-panel {
  border-top: 1px solid #edf2f7;
  background: #f8fbff;
  padding: 0.65rem 0.8rem 0.8rem;
  max-height: 42%;
  overflow: auto;
}

.ai-contact-title {
  margin: 0;
  font-size: 0.83rem;
  font-weight: 700;
  color: #0c3b63;
}

.ai-contact-meta {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: #35526f;
}

.ai-quick-form {
  margin-top: 0.55rem;
  display: grid;
  gap: 0.35rem;
}

.ai-quick-form input,
.ai-quick-form select,
.ai-quick-form textarea {
  width: 100%;
  border: 1px solid #d4dce6;
  border-radius: 9px;
  font-size: 0.8rem;
  font-family: inherit;
  padding: 0.48rem 0.56rem;
  background: #fff;
}

.ai-quick-form button {
  border: 0;
  border-radius: 9px;
  padding: 0.48rem 0.62rem;
  background: #0068a5;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.ai-contact-notice {
  margin: 0.45rem 0 0;
  font-size: 0.78rem;
  color: #0f4f7e;
}

@media (max-width: 900px) {
  .ai-support-root {
    right: 0.5rem;
    bottom: 0.5rem;
    left: 0.5rem;
  }

  .ai-trigger {
    align-items: center;
    width: 100%;
  }

  .ai-panel {
    width: 100%;
    height: min(82vh, 760px);
  }
}

@media (max-width: 600px) {
  .ai-panel {
    height: min(86vh, 840px);
  }

  .ai-chat-form {
    grid-template-columns: 1fr;
  }

  .ai-send {
    width: 100%;
  }
}
</style>
