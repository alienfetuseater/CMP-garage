<template>
  <main class="auth-page">
    <section class="auth-card">
      <h1>Create Account</h1>
      <p class="auth-subtitle">Register to access Coastal Marine Pro.</p>

      <form class="auth-form" @submit.prevent="onSubmit">
        <label>
          Full Name
          <input v-model.trim="name" type="text" autocomplete="name" required />
        </label>

        <label>
          Email
          <input v-model.trim="email" type="email" autocomplete="email" required />
        </label>

        <label>
          Password
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </label>

        <p class="hint">Use at least 8 characters.</p>
        <p v-if="errorText" class="auth-error">{{ errorText }}</p>

        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account?
        <RouterLink :to="{ name: 'Login' }">Sign in</RouterLink>
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const formError = ref('')

const errorText = computed(() => formError.value || authStore.error || '')

async function onSubmit() {
  formError.value = ''

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    })

    await router.push({ name: 'CMPHome' })
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
  background: linear-gradient(180deg, #f0f9ff 0%, #dcfce7 100%);
}

.auth-card {
  width: min(100%, 460px);
  background: #ffffff;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  padding: 1.35rem;
}

.auth-card h1 {
  margin: 0;
  color: #14532d;
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
  border-color: #16a34a;
  outline: none;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.16);
}

.hint {
  margin: 0;
  font-size: 0.83rem;
  color: #475569;
}

button {
  border: 1px solid #15803d;
  background: linear-gradient(180deg, #22c55e, #16a34a);
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
  color: #166534;
  font-weight: 700;
  text-decoration: none;
}
</style>
