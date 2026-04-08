<template>
  <main class="tenant-page">
    <header class="hero">
      <div>
        <NuxtLink to="/tenant" class="back-link">返回租户首页</NuxtLink>
        <p class="eyebrow">Readonly Chats</p>
        <h1>聊天记录</h1>
        <p class="hero-copy">这里只显示当前租户自己的会话，不提供删除、编辑或重新训练操作。</p>
      </div>
      <div class="hero-stat">
        <strong>{{ items.length }}</strong>
        <span>个会话</span>
      </div>
    </header>

    <section v-if="items.length" class="chat-grid">
      <article v-for="item in items" :key="item.session.id" class="chat-card">
        <header class="card-head">
          <div>
            <h2>{{ item.session.id }}</h2>
            <p>访客：{{ item.session.visitorId }}</p>
          </div>
          <div class="meta-stack">
            <span>开始于 {{ formatDate(item.session.startedAt) }}</span>
            <span>最后消息 {{ formatDate(item.session.lastMessageAt) }}</span>
          </div>
        </header>

        <div class="message-list">
          <article v-for="message in item.messages" :key="message.id" class="message-card" :class="`role-${message.role}`">
            <p class="message-role">{{ message.role === 'user' ? '客户' : 'AI 客服' }}</p>
            <p class="message-content">{{ message.content }}</p>

            <div v-if="message.matchedContentSources?.length" class="message-box">
              <p class="box-title">命中资料源</p>
              <ul class="tag-list">
                <li v-for="source in message.matchedContentSources" :key="source.id">
                  <span>[{{ source.type }}]</span>
                  {{ source.title }}
                  <em v-if="source.category">/{{ source.category }}</em>
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
      </article>
    </section>

    <section v-else class="panel empty-panel">
      <h2>当前还没有聊天记录</h2>
      <p>租户登录后可以在这里只读查看客户咨询过程、附件截图和命中资料。</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { ChatMessageRecord, ChatSessionRecord } from '../../types'

interface TenantChatItem {
  session: ChatSessionRecord
  messages: ChatMessageRecord[]
}

const items = ref<TenantChatItem[]>([])
const { request } = useTenantApi()

function formatDate(value: number) {
  return new Date(value).toLocaleString()
}

async function loadChats() {
  const response = await request<{ items: TenantChatItem[] }>('/api/tenant/chats')
  items.value = response.items
}

try {
  await loadChats()
} catch {
  await navigateTo('/tenant/login')
}
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
.chat-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #d9e6ed;
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 16px 40px rgba(36, 76, 96, 0.08);
}
.back-link,
.eyebrow,
.hero-copy,
.hero-stat span,
.card-head p,
.meta-stack span,
.message-role,
.box-title,
.attachment-card span {
  margin: 0;
}
.back-link {
  display: inline-flex;
  margin-bottom: 14px;
  color: #0c607b;
  text-decoration: none;
  font-weight: 700;
}
.eyebrow {
  color: #0c607b;
  font-weight: 700;
}
.hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.hero-copy {
  margin-top: 8px;
  color: #536c7e;
  line-height: 1.7;
}
.hero-stat {
  min-width: 140px;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #0a7ea4 0%, #0c607b 100%);
  color: #fff;
  text-align: center;
}
.hero-stat strong {
  display: block;
  font-size: 36px;
}
.chat-grid,
.message-list,
.attachment-grid {
  display: grid;
  gap: 14px;
}
.card-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.card-head h2 {
  margin: 0;
  font-size: 20px;
}
.card-head p,
.meta-stack span,
.message-role,
.message-content,
.empty-panel p {
  color: #5c7485;
}
.meta-stack {
  display: grid;
  gap: 8px;
  justify-items: end;
}
.message-card {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid #e1eaf0;
  background: #f9fbfc;
}
.role-user {
  border-color: #d6e8ee;
  background: #f8fcfd;
}
.role-assistant {
  border-color: #dce5f4;
  background: #f7f9fd;
}
.message-role {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.message-content {
  margin: 10px 0 0;
  line-height: 1.7;
  white-space: pre-wrap;
}
.message-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e5edf3;
}
.box-title {
  color: #17394f;
  font-weight: 700;
}
.tag-list {
  margin: 10px 0 0;
  padding-left: 18px;
  color: #3a566b;
}
.tag-list li + li {
  margin-top: 6px;
}
.tag-list span,
.tag-list em {
  color: #0c607b;
  font-style: normal;
}
.attachment-grid {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  margin-top: 10px;
}
.attachment-card {
  display: grid;
  gap: 8px;
  text-decoration: none;
  color: #17394f;
}
.attachment-card img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #dbe7ef;
  background: #f3f7fa;
}
.attachment-card span {
  font-size: 13px;
  color: #5c7485;
  word-break: break-all;
}
.empty-panel h2 {
  margin: 0;
}
.empty-panel p {
  margin: 8px 0 0;
  line-height: 1.7;
}
@media (max-width: 900px) {
  .hero,
  .card-head {
    grid-template-columns: 1fr;
    display: grid;
  }
  .meta-stack {
    justify-items: start;
  }
}
</style>
