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

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Customer } from '@/types/mock'

export default defineComponent({
  setup() {
    const form = ref({ name: '', phone: '', email: '', address: '' })
    const loading = ref(false)
    const error = ref<string | null>(null)
    const success = ref(false)

    const router = useRouter()

    async function submit() {
      loading.value = true
      error.value = null
      success.value = false
      const payload = { ...form.value }

      let newId: string | null = null

      // try posting to local API first; if it fails, fall back to localStorage
      let apiErrorMsg: string | null = null
      try {
        const res = await fetch('http://localhost:4000/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          const saved = await res.json()
          newId = saved?.id ?? null
          success.value = true
          form.value = { name: '', phone: '', email: '', address: '' }
          if (newId) {
            router.push({ name: 'CustomerProfile', query: { id: newId } })
            return
          }
          return
        }

        apiErrorMsg = `API responded ${res.status} ${res.statusText}`
        console.warn('CustomerRegistration: API POST failed', apiErrorMsg)
      } catch (err) {
        apiErrorMsg = err instanceof Error ? err.message : String(err)
        console.warn('CustomerRegistration: API POST error', apiErrorMsg)
      }

      // fallback: save into localStorage and offer download of the updated JSON
      try {
        let list: Customer[] = []
        const local = localStorage.getItem('mockCustomers')
        if (local) {
          try {
            list = JSON.parse(local)
          } catch (pe) {
            console.warn('CustomerRegistration: failed to parse local mockCustomers, resetting', pe)
            list = []
          }
        } else {
          const res = await fetch('/mock/customers.json')
          if (res.ok) {
            try {
              list = await res.json()
            } catch (je) {
              console.warn('CustomerRegistration: failed to parse /mock/customers.json', je)
              list = []
            }
          } else {
            list = []
          }
        }

        const id = `cust-${String(Math.floor(Math.random() * 90000) + 10000)}`
        const createdAt = new Date().toISOString().slice(0, 10)
        const newCustomer = {
          id,
          name: payload.name,
          phone: payload.phone || '',
          email: payload.email || '',
          address: payload.address || '',
          createdAt,
        }

        list.push(newCustomer)
        newId = newCustomer.id
        localStorage.setItem('mockCustomers', JSON.stringify(list))

        // trigger download so user can persist changes manually if desired
        try {
          const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'customers.updated.json'
          a.click()
          URL.revokeObjectURL(url)
        } catch (dlErr) {
          console.warn('CustomerRegistration: download failed', dlErr)
        }

        success.value = true
        form.value = { name: '', phone: '', email: '', address: '' }
        if (newId) {
          router.push({ name: 'CustomerProfile', query: { id: newId } })
          return
        }
      } catch (err2) {
        const fallbackMsg = err2 instanceof Error ? err2.message : String(err2)
        error.value = apiErrorMsg
          ? `API error: ${apiErrorMsg}; Fallback error: ${fallbackMsg}`
          : fallbackMsg
        console.error('CustomerRegistration: final error', error.value)
      } finally {
        loading.value = false
      }
    }

    return { form, loading, error, success, submit }
  },
})
</script>

<style scoped>
.customer-registration {
  padding: 12px;
}
form {
  display: grid;
  gap: 8px;
  max-width: 480px;
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
