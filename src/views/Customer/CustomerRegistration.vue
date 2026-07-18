<template>
  <main class="customer-registration">
    <h2>Register New Customer</h2>
    <form @submit.prevent="submit">
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

      <div class="actions">
        <button type="submit" :disabled="loading">Create</button>
        <span v-if="loading">Saving...</span>
        <span v-if="success" class="success">Saved</span>
        <span v-if="error" class="error">{{ error }}</span>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/api'
import { useCustomerStore } from '@/stores/customers'
import type { Customer } from '@/types/mock'

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
    const saved = await apiFetch<Customer>('/newCustomer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    customerStore.addCustomer(saved)

    const newId = saved?.id ?? null
    success.value = true
    form.value = { name: '', phone: '', email: '', address: '' }

    if (newId) {
      router.push({ name: 'CustomerProfile', query: { id: newId } })
      return
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.customer-registration {
  min-height: calc(100vh - 24px);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
form {
  display: grid;
  gap: 8px;
  max-width: 480px;
  width: 100%;
}
label {
  display: flex;
  flex-direction: column;
}
.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.error {
  color: #b91c1c;
}
.success {
  color: #059669;
}
button[disabled] {
  opacity: 0.6;
}
</style>
