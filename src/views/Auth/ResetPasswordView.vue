<template>
  <main class="auth-page">
    <section class="auth-card">
      <h1>Reset Password</h1>
      <p class="auth-subtitle">Create a new password for your account.</p>

      <form class="auth-form" @submit.prevent="onSubmit">
        <label>
          New Password
          <input v-model="password" type="password" autocomplete="new-password" required />
        </label>

        <label>
          Confirm Password
          <input v-model="confirmPassword" type="password" autocomplete="new-password" required />
        </label>

        <p v-if="successMessage" class="auth-success">{{ successMessage }}</p>
        <p v-if="errorText" class="auth-error">{{ errorText }}</p>

        <button type="submit" :disabled="submitting || !resetToken">
          {{ submitting ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>

      <p class="auth-footer">
        Back to
        <RouterLink :to="{ name: 'Login' }">sign in</RouterLink>
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/services/http/client'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const submitting = ref(false)
const successMessage = ref('')
const errorText = ref('')

const resetToken = computed(() => {
  const tokenFromQuery =
    (typeof route.query.token === 'string' ? route.query.token : '') ||
    (typeof route.query.resetToken === 'string' ? route.query.resetToken : '') ||
    (typeof route.query.code === 'string' ? route.query.code : '')
  const tokenFromPath = typeof route.params.token === 'string' ? route.params.token : ''
  return String(tokenFromQuery || tokenFromPath).trim()
})

async function onSubmit() {
  successMessage.value = ''
  errorText.value = ''

  if (!resetToken.value) {
    errorText.value = 'Reset token is missing. Please use the password reset link from your email.'
    return
  }

  if (password.value.length < 8) {
    errorText.value = 'Password must be at least 8 characters long.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorText.value = 'Passwords do not match.'
    return
  }

  submitting.value = true

  try {
    const result = await apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken.value, password: password.value }),
    })

    successMessage.value = result.message
    setTimeout(() => {
      void router.push({ name: 'Login' })
    }, 900)
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : String(error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: linear-gradient(180deg, #edf7ff 0%, #d7e8f5 100%);
}

.auth-card {
  width: min(100%, 460px);
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  padding: 1.35rem;
}

.auth-card h1 {
  margin: 0;
  color: #0f172a;
}

.auth-subtitle {
  margin-top: 0.35rem;
  color: #475569;
}

.auth-form {
  margin-top: 1rem;
  display: grid;
  gap: 0.8rem;
}

label {
  display: grid;
  gap: 0.35rem;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.92rem;
}

input {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  font: inherit;
}

input:focus {
  border-color: #0284c7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

button {
  border: 1px solid #0369a1;
  background: linear-gradient(180deg, #0ea5e9, #0284c7);
  color: #ffffff;
  border-radius: 10px;
  padding: 0.7rem 0.9rem;
  font-weight: 700;
}

button:disabled {
  opacity: 0.7;
}

.auth-error {
  margin: 0;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  white-space: pre-wrap;
}

.auth-success {
  margin: 0;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.auth-footer {
  margin-top: 1rem;
  color: #334155;
}

.auth-footer a {
  color: #0369a1;
  font-weight: 700;
  text-decoration: none;
}
</style>
