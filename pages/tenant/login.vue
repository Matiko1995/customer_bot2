<template>
  <main class="tenant-shell">
    <section class="tenant-card">
      <p class="eyebrow">Tenant Portal</p>
      <h1>租户登录</h1>

      <div class="mode-switch">
        <button type="button" :class="{ active: mode === 'login' }" @click="mode = 'login'">登录</button>
        <button type="button" :class="{ active: mode === 'reset' }" @click="mode = 'reset'">重置密码</button>
      </div>

      <form v-if="mode === 'login'" class="form-grid" @submit.prevent="login">
        <input v-model.trim="email" type="email" placeholder="登录邮箱" required />
        <input v-model="password" type="password" placeholder="密码" required />
        <button type="submit" :disabled="submitting">{{ submitting ? '登录中...' : '登录' }}</button>
      </form>

      <form v-else class="form-grid" @submit.prevent="requestResetCode">
        <input v-model.trim="resetEmail" type="email" placeholder="登录邮箱" required />
        <button type="submit" :disabled="submitting">{{ submitting ? '发送中...' : '生成重置码' }}</button>
      </form>

      <form v-if="resetCodeIssued" class="form-grid secondary-form" @submit.prevent="confirmReset">
        <input v-model.trim="resetCode" type="text" placeholder="6 位重置码" required />
        <input v-model="nextPassword" type="password" placeholder="新密码" required />
        <button type="submit" :disabled="submitting">{{ submitting ? '提交中...' : '确认重置并登录' }}</button>
      </form>

      <p v-if="notice" class="notice">{{ notice }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </section>
  </main>
</template>

<script setup lang="ts">
const mode = ref<'login' | 'reset'>('login')
const email = ref('')
const password = ref('')
const resetEmail = ref('')
const resetCode = ref('')
const nextPassword = ref('')
const resetCodeIssued = ref(false)
const submitting = ref(false)
const notice = ref('')
const errorMessage = ref('')

async function login() {
  if (submitting.value) return
  submitting.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    await $fetch('/api/tenant/login', {
      method: 'POST',
      credentials: 'include',
      body: {
        email: email.value,
        password: password.value
      }
    })
    await navigateTo('/tenant')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败'
  } finally {
    submitting.value = false
  }
}

async function requestResetCode() {
  if (submitting.value) return
  submitting.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    const response = await $fetch<{ item: { provider: string; previewCode?: string; expiresAt: number } }>('/api/tenant/reset-code', {
      method: 'POST',
      body: {
        email: resetEmail.value
      }
    })
    resetCodeIssued.value = true
    notice.value =
      response.item.previewCode
        ? `已生成重置码：${response.item.previewCode}，有效至 ${new Date(response.item.expiresAt).toLocaleString()}`
        : `重置码邮件已发送，有效至 ${new Date(response.item.expiresAt).toLocaleString()}`
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '生成重置码失败'
  } finally {
    submitting.value = false
  }
}

async function confirmReset() {
  if (submitting.value) return
  submitting.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    await $fetch('/api/tenant/reset-password', {
      method: 'POST',
      credentials: 'include',
      body: {
        email: resetEmail.value,
        code: resetCode.value,
        nextPassword: nextPassword.value
      }
    })
    await navigateTo('/tenant')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '重置失败'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.tenant-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(180deg, #eef6fb, #f8fbfd);
}
.tenant-card {
  width: min(460px, 100%);
  display: grid;
  gap: 14px;
  padding: 28px;
  border-radius: 22px;
  background: white;
  box-shadow: 0 20px 50px rgba(20, 51, 73, 0.08);
}
.eyebrow, .notice, .error {
  margin: 0;
}
.mode-switch {
  display: flex;
  gap: 10px;
}
.mode-switch button,
.form-grid button {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #cfd9e2;
  font: inherit;
}
.mode-switch button.active,
.form-grid button {
  background: #0a7ea4;
  color: white;
  border-color: #0a7ea4;
  font-weight: 700;
}
.form-grid {
  display: grid;
  gap: 12px;
}
.secondary-form {
  padding-top: 10px;
  border-top: 1px solid #edf2f7;
}
input {
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #cfd9e2;
  font: inherit;
}
.notice {
  color: #0c607b;
  white-space: pre-wrap;
}
.error {
  color: #b42318;
}
</style>
