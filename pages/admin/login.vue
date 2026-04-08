<template>
  <main class="admin-shell">
    <form class="admin-card" @submit.prevent="login">
      <p class="eyebrow">Admin</p>
      <h1>后台登录</h1>
      <input v-model.trim="email" type="email" placeholder="邮箱" required />
      <input v-model="password" type="password" placeholder="密码" required />
      <button type="submit" :disabled="submitting">{{ submitting ? '登录中...' : '登录' }}</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p class="hint">默认账号：`admin@example.com` / `admin123456`</p>
    </form>
  </main>
</template>

<script setup lang="ts">
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
.admin-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(180deg, #eef6fb, #f8fbfd);
}

.admin-card {
  width: min(420px, 100%);
  display: grid;
  gap: 12px;
  padding: 28px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 20px 50px rgba(20, 51, 73, 0.08);
}

.eyebrow, .hint, .error {
  margin: 0;
}

.hint {
  color: #5b7388;
  font-size: 0.9rem;
}

.error {
  color: #b42318;
}

input, button {
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #cfd9e2;
  font: inherit;
}

button {
  border: 0;
  background: #0a7ea4;
  color: white;
  font-weight: 700;
}
</style>
