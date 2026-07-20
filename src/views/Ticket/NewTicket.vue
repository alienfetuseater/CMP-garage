<template>
  <main class="ticket-create-page">
    <div class="ticket-shell">
      <button class="back" @click="goBack">← Back</button>

      <section class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">Ticket creation</p>
            <h2>New Ticket</h2>
          </div>
        </header>

        <form class="ticket-form" @submit.prevent="submit">
          <div class="form-grid">
            <label>
              Customer Name
              <input v-model="form.customerName" />
            </label>

            <label>
              Vessel Name
              <input v-model="form.vesselName" />
            </label>

            <label>
              Customer ID
              <input v-model="form.customerId" required />
            </label>

            <label>
              Vessel ID
              <input v-model="form.vesselId" required />
            </label>

            <label>
              Service Category
              <select v-model="form.service_category" required>
                <option value="inspection">inspection</option>
                <option value="repair">repair</option>
                <option value="maintenance">maintenance</option>
                <option value="upgrade">upgrade</option>
              </select>
            </label>

            <label>
              Status
              <select v-model="form.status" required>
                <option value="open">open</option>
                <option value="in progress">in progress</option>
                <option value="completed">completed</option>
                <option value="closed">closed</option>
                <option value="cancelled">cancelled</option>
                <option value="on hold">on hold</option>
              </select>
            </label>

            <label>
              Priority
              <select v-model="form.priority" required>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </label>

            <label>
              Scheduled Date
              <input v-model="form.scheduledDate" type="date" required />
            </label>
          </div>

          <label>
            Service Title
            <input v-model="form.service_title" required />
          </label>

          <label>
            Notes
            <textarea v-model="form.notes" rows="5" />
          </label>

          <div class="actions">
            <button type="submit" class="primary" :disabled="submitting">Create Ticket</button>
            <span v-if="submitting">Saving...</span>
            <span v-if="success" class="success">Saved</span>
            <span v-if="error" class="error">{{ error }}</span>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api'
import { useTicketStore } from '@/stores/tickets'
import type { Ticket } from '@/types/mock'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()

const submitting = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  customerName: '',
  vesselName: '',
  customerId: '',
  vesselId: '',
  service_category: 'repair',
  service_title: '',
  status: 'open',
  priority: 'medium',
  scheduledDate: '',
  notes: '',
})

function hydrateFromQuery() {
  const vesselId = String(route.query.vesselId || '')
  const customerId = String(route.query.customerId || '')
  const customerName = String(route.query.customerName || '')
  const vesselName = String(route.query.vesselName || '')

  if (vesselId) form.vesselId = vesselId
  if (customerId) form.customerId = customerId
  if (customerName) form.customerName = customerName
  if (vesselName) form.vesselName = vesselName
}

async function submit() {
  submitting.value = true
  success.value = false
  error.value = null

  try {
    const payload = {
      ...form,
      createdAt: new Date().toISOString(),
      messages: [],
    }

    const saved = await apiFetch<Ticket>('/newTicket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    ticketStore.addTicket(saved)
    success.value = true
    router.push({ name: 'Ticket', query: { id: saved.id } })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.back()
}

onMounted(hydrateFromQuery)
</script>

<style scoped>
.ticket-create-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.ticket-shell {
  width: min(100%, 920px);
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

.ticket-form {
  display: grid;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.diagnostics-section {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
}

.section-heading h3 {
  margin: 0;
  color: #0f172a;
}

.section-heading p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.diagnostics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #334155;
  font-weight: 600;
  min-width: 0;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  background: #ffffff;
  color: #0f172a;
}

textarea {
  resize: vertical;
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

  .diagnostics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
