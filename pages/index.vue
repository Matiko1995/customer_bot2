<template>
  <main class="page-shell">
    <section class="hero-card">
      <p class="eyebrow">Customer Bot Demo</p>
      <h1>AI 客服最小可运行版本</h1>
      <p class="lead">
        这个首页现在会直接挂载一个可对话的租户版前台挂件。后台请访问 <code>/admin/login</code>，默认可先用
        <code>tenant-demo</code> 做演示，也可以创建新的租户后再把 <code>tenantId</code> 分发给客户站点安装。
      </p>

      <p class="tenant-tip">
        当前演示租户：<code>{{ activeTenantId }}</code>
      </p>

      <div class="demo-grid">
        <article>
          <h2>租户运行时配置</h2>
          <p>挂件初始化可按租户读取品牌、联系方式和系统提示词。</p>
        </article>
        <article>
          <h2>服务端聊天</h2>
          <p>聊天消息通过服务端接口转发，可记录会话、Token 用量和后续账单。</p>
        </article>
        <article>
          <h2>后台试运营</h2>
          <p>管理员可创建租户、查看聊天、查看留资，并准备客户安装脚本。</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { DEMO_TENANT_ID } from '../lib/demo-config'

const route = useRoute()
const activeTenantId = computed(() => {
  const queryTenantId = typeof route.query.tenantId === 'string' ? route.query.tenantId.trim() : ''
  return queryTenantId || DEMO_TENANT_ID
})

let widgetInstance:
  | {
      init(options?: { tenantId?: string }): void
      destroy(): void
    }
  | undefined

onMounted(async () => {
  const { createCustomerBot } = await import('../src/widget')
  widgetInstance = createCustomerBot()
  widgetInstance.init({
    tenantId: activeTenantId.value
  })
})

onBeforeUnmount(() => {
  widgetInstance?.destroy()
  widgetInstance = undefined
})
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 40px 20px 140px;
  background:
    radial-gradient(circle at top left, rgba(17, 138, 178, 0.18), transparent 30%),
    linear-gradient(180deg, #f5fbff 0%, #eef5f9 100%);
  color: #14324a;
}

.hero-card {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px;
  border: 1px solid rgba(19, 63, 92, 0.08);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 24px 60px rgba(16, 60, 92, 0.08);
  backdrop-filter: blur(10px);
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #0e628f;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.05;
}

.lead {
  max-width: 720px;
  margin: 16px 0 0;
  font-size: 1.05rem;
  line-height: 1.7;
}

.tenant-tip {
  margin: 12px 0 0;
  color: #2f5976;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 28px;
}

.demo-grid article {
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #f3f9fd);
  border: 1px solid rgba(17, 95, 153, 0.1);
}

.demo-grid h2 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.demo-grid p {
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 800px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
