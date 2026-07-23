<template>
  <main class="auth-page">
    <section class="auth-card">
      <h1>Sign In</h1>
      <p class="auth-subtitle">Access your Coastal Marine Pro dashboard.</p>

      <form class="auth-form" @submit.prevent="onSubmit">
        <label>
          Email
          <input v-model.trim="email" type="email" autocomplete="email" required />
        </label>

        <label>
          Password
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>

        <p v-if="errorText" class="auth-error">{{ errorText }}</p>

        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="auth-footer">
        Need an account?
        <RouterLink :to="{ name: 'Register' }">Create one</RouterLink>
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const formError = ref('')

const errorText = computed(() => formError.value || authStore.error || '')

async function onSubmit() {
  formError.value = ''

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch (error) {
    formError.value = error instanceof Error ? error.message : String(error)
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
  width: min(100%, 440px);
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
