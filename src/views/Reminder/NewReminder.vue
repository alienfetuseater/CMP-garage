<template>
  <main class="reminder-create-page">
    <div class="reminder-shell">
      <button class="back" @click="goBack">← Back</button>

      <section class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">Reminder creation</p>
            <h2>New Reminder</h2>
          </div>
        </header>

        <form class="reminder-form" @submit.prevent="submit">
          <label>
            Title
            <input v-model="form.title" required />
          </label>

          <div class="form-grid">
            <label>
              Due Date
              <input v-model="form.dueDate" type="datetime-local" required />
            </label>

            <label>
              Related Type
              <select v-model="form.relatedType" required>
                <option value="customer">customer</option>
                <option value="vessel">vessel</option>
                <option value="ticket">ticket</option>
              </select>
            </label>

            <label class="full-width">
              Related Item
              <select v-model="form.relatedId" required>
                <option value="" disabled>Select a {{ form.relatedType }}</option>
                <option v-for="option in relatedOptions" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>

          <label class="checkbox-row">
            <input v-model="form.completed" type="checkbox" />
            Mark as completed
          </label>

          <label>
            Notes
            <textarea v-model="form.notes" rows="5" placeholder="Add reminder notes" />
          </label>

          <div class="actions">
            <button type="submit" class="primary" :disabled="submitting || !form.relatedId">
              Create Reminder
            </button>
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api'
import { useUiStore } from '@/stores/ui'
import { useReminderStore } from '@/stores/reminders'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import { useTicketStore } from '@/stores/tickets'
import type { Reminder } from '@/types/mock'

type RelatedType = Reminder['relatedTo']['type']
type ReminderApiRecord = Reminder & { _id?: string }

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const reminderStore = useReminderStore()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
const ticketStore = useTicketStore()

const submitting = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  title: '',
  dueDate: '',
  relatedType: 'customer' as RelatedType,
  relatedId: '',
  completed: false,
  notes: '',
})

const relatedOptions = computed(() => {
  if (form.relatedType === 'customer') {
    return customerStore.customers.map((customer) => ({
      id: customer.id,
      label: `${customer.name} (${customer.phone})`,
    }))
  }

  if (form.relatedType === 'vessel') {
    return vesselStore.vessels.map((vessel) => ({
      id: vessel.id,
      label: `${vessel.vesselName} (${vessel.vesselMake} ${vessel.vesselYear})`,
    }))
  }

  return ticketStore.tickets.map((ticket) => ({
    id: ticket.id,
    label: `${ticket.service_title} (${ticket.status})`,
  }))
})

watch(
  () => form.relatedType,
  () => {
    form.relatedId = ''
  },
)

function hydrateFromQuery() {
  const relatedType = String(route.query.type || '') as RelatedType
  const relatedId = String(route.query.id || '')

  if (relatedType === 'customer' || relatedType === 'vessel' || relatedType === 'ticket') {
    form.relatedType = relatedType
  }

  if (relatedId) {
    form.relatedId = relatedId
  }
}

async function submit() {
  submitting.value = true
  success.value = false
  error.value = null

  try {
    const payload = {
      title: form.title.trim(),
      dueDate: new Date(form.dueDate).toISOString(),
      completed: form.completed,
      notes: form.notes.trim(),
      relatedTo: {
        type: form.relatedType,
        id: form.relatedId,
      },
    }

    const saved = await apiFetch<ReminderApiRecord>('/newReminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    reminderStore.addReminder(saved)
    success.value = true

    const reminderId = String(saved.id ?? saved._id ?? '')
    if (!reminderId) {
      throw new Error('Reminder saved, but no reminder id was returned')
    }

    router.push({ name: 'Reminder', query: { id: reminderId } })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.back()
}

onMounted(async () => {
  await uiStore.fetchAllData()
  hydrateFromQuery()
})
</script>

<style scoped>
.reminder-create-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.reminder-shell {
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

.reminder-form {
  display: grid;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.full-width {
  grid-column: 1 / -1;
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
select {
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
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  background: #ffffff;
  color: #0f172a;
  resize: vertical;
}

.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-direction: row;
}

.checkbox-row input {
  width: 18px;
  height: 18px;
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
