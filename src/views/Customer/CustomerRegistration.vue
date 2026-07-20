<template>
  <main class="customer-registration-page">
    <div class="customer-registration-shell">
      <button class="back" @click="goBack">← Back</button>

      <section class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">Customer creation</p>
            <h2>Register New Customer</h2>
          </div>
        </header>

        <form class="registration-form" @submit.prevent="submit">
          <div class="form-grid">
            <label>
              Name
              <input v-model="form.name" required />
            </label>

            <label>
              Phone
              <input v-model="form.phone" />
            </label>

            <label>
              Email
              <input v-model="form.email" type="email" />
            </label>

            <label>
              Address
              <input v-model="form.address" />
            </label>
          </div>

          <div class="actions">
            <button type="submit" class="primary" :disabled="loading">Create Customer</button>
            <span v-if="loading">Saving...</span>
            <span v-if="success" class="success">Saved</span>
            <span v-if="error" class="error">{{ error }}</span>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/api'
import { useCustomerStore } from '@/stores/customers'
import type { Customer } from '@/types/mock'

type CustomerApiRecord = Customer & {
  _id?: string
}

const form = ref({ name: '', phone: '', email: '', address: '' })
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const router = useRouter()
const customerStore = useCustomerStore()

async function submit() {
  loading.value = true
  error.value = null
  success.value = false
  const payload = { ...form.value }

  try {
    const saved = await apiFetch<CustomerApiRecord>('/newCustomer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    customerStore.addCustomer(saved)

    const newId = String(saved.id ?? saved._id ?? '')
    if (!newId) {
      throw new Error('Customer saved, but no customer id was returned')
    }

    router.push({ name: 'CustomerProfile', query: { id: newId } })
    success.value = true
    form.value = { name: '', phone: '', email: '', address: '' }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.customer-registration-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.customer-registration-shell {
  width: min(100%, 880px);
}

.profile-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 24px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  margin-bottom: 16px;
  padding: 0;
  font-weight: 600;
}

.profile-header {
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #64748b;
}

.profile-header h2 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.1;
  color: #0f172a;
}

.registration-form {
  display: grid;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #334155;
  font-weight: 600;
  min-width: 0;
}

input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  background: #ffffff;
  color: #0f172a;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.primary {
  border: 1px solid #1d4ed8;
  background: #2563eb;
  color: #ffffff;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
}

.success {
  color: #059669;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
