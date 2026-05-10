<template>
  <main class="login-shell">
    <section class="login-brand">
      <div class="brand-mark">
        <Bot :size="26" />
      </div>
      <p>智能客服运营</p>
      <h1>智服多租户平台</h1>
      <div class="brand-grid">
        <article>
          <Activity :size="18" />
          <strong>全局监控</strong>
          <span>平台健康与租户风险</span>
        </article>
        <article>
          <Database :size="18" />
          <strong>知识运营</strong>
          <span>资料命中与训练记录</span>
        </article>
      </div>
    </section>

    <form class="login-card" @submit.prevent="login">
      <div class="card-head">
        <div class="card-icon">
          <ShieldCheck :size="22" />
        </div>
        <div>
          <p>管理员入口</p>
          <h2>后台登录</h2>
        </div>
      </div>
      <label>
        <span>邮箱</span>
        <input v-model.trim="email" type="email" placeholder="邮箱" required />
      </label>
      <label>
        <span>密码</span>
        <input v-model="password" type="password" placeholder="密码" required />
      </label>
      <button type="submit" :disabled="submitting">
        <LogIn :size="16" />
        {{ submitting ? '登录中...' : '登录' }}
      </button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p class="hint">默认账号：<code>admin@example.com</code> / <code>admin123456</code></p>
    </form>
  </main>
</template>

<script setup lang="ts">
import { Activity, Bot, Database, LogIn, ShieldCheck } from '../../lib/lucide-icons'

const email = ref('admin@example.com')
const password = ref('admin123456')
const submitting = ref(false)
const errorMessage = ref('')

async function login() {
  if (submitting.value) {
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'include',
      body: {
        email: email.value,
        password: password.value
      }
    })
    await navigateTo('/admin/tenants')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(360px, 1.1fr);
  background: #f8fafc;
}

.login-brand {
  min-height: 100vh;
  padding: clamp(32px, 6vw, 72px);
  display: grid;
  align-content: center;
  gap: 22px;
  color: #ffffff;
  background: #0f172a;
}

.brand-mark,
.card-icon {
  display: grid;
  place-items: center;
  border-radius: 16px;
}

.brand-mark {
  width: 58px;
  height: 58px;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  box-shadow: 0 22px 42px rgba(37, 99, 235, 0.3);
}

.login-brand p {
  margin: 0;
  color: #60a5fa;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.login-brand h1 {
  max-width: 520px;
  margin: 0;
  font-size: clamp(38px, 6vw, 72px);
  line-height: 0.98;
}

.brand-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.brand-grid article {
  padding: 16px;
  display: grid;
  gap: 8px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-grid svg {
  color: #60a5fa;
}

.brand-grid strong,
.brand-grid span {
  display: block;
}

.brand-grid span {
  color: #94a3b8;
  font-size: 12px;
}

.login-card {
  align-self: center;
  justify-self: center;
  width: min(440px, calc(100% - 40px));
  display: grid;
  gap: 16px;
  padding: 30px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.1);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}

.card-icon {
  width: 48px;
  height: 48px;
  color: #2563eb;
  background: #eff6ff;
}

.card-head p,
.card-head h2,
.hint,
.error {
  margin: 0;
}

.card-head p {
  color: #2563eb;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.card-head h2 {
  color: #0f172a;
}

label {
  display: grid;
  gap: 8px;
}

label span {
  color: #475569;
  font-size: 12px;
  font-weight: 900;
}

input,
button {
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font: inherit;
}

input {
  padding: 0 13px;
  color: #334155;
  background: #f8fafc;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  color: #ffffff;
  background: #0f172a;
  font-weight: 900;
  cursor: pointer;
}

.hint {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.hint code {
  color: #0f172a;
  font-weight: 900;
}

.error {
  color: #b91c1c;
  font-weight: 800;
}

@media (max-width: 860px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-brand {
    min-height: 42vh;
  }

  .login-card {
    margin: 28px 0;
  }
}
</style>
