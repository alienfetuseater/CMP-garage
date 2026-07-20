<template>
  <main class="ticket-create-page">
    <div class="ticket-shell">
      <button class="back" @click="goBack">← Back</button>

      <section class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">{{ isEditMode ? 'Ticket update' : 'Ticket creation' }}</p>
            <h2>{{ isEditMode ? 'Update Work Order' : 'Create Work Order' }}</h2>
          </div>
        </header>

        <form class="ticket-form" @submit.prevent="submit">
          <div class="form-grid">
            <label>
              Customer Name
              <input
                v-model="form.customerName"
                :disabled="isEditMode"
                :class="{ immutable: isEditMode }"
              />
            </label>

            <label>
              Vessel Name
              <input
                v-model="form.vesselName"
                :disabled="isEditMode"
                :class="{ immutable: isEditMode }"
              />
            </label>

            <label>
              Customer ID
              <input
                v-model="form.customerId"
                required
                :disabled="isEditMode"
                :class="{ immutable: isEditMode }"
              />
            </label>

            <label>
              Vessel ID
              <input
                v-model="form.vesselId"
                required
                :disabled="isEditMode"
                :class="{ immutable: isEditMode }"
              />
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

          <section class="plan-section">
            <div class="section-heading">
              <h3>Plan of Action</h3>
              <p>Add tasks and check them off to track work progress.</p>
            </div>

            <div class="plan-list">
              <div v-for="(item, index) in form.planOfAction" :key="item.id" class="plan-row">
                <input v-model="item.completed" type="checkbox" class="plan-check" />
                <input v-model="item.text" class="plan-input" placeholder="Task description" />
                <button type="button" class="ghost" @click="removePlanItem(index)">Remove</button>
              </div>
            </div>

            <button type="button" class="ghost" @click="addPlanItem">Add Plan Item</button>
          </section>

          <div class="actions">
            <button type="submit" class="primary" :disabled="submitting">
              {{ isEditMode ? 'Update Ticket' : 'Create Ticket' }}
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
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api'
import { useTicketStore } from '@/stores/tickets'
import type { PlanActionItem, Ticket } from '@/types/mock'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()

const submitting = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const editTicketId = computed(() => String(route.query.id || ''))
const isEditMode = computed(() => Boolean(editTicketId.value))

const makePlanItem = (text = '', completed = false): PlanActionItem => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  text,
  completed,
})

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
  planOfAction: [] as PlanActionItem[],
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

function hydrateFromTicket(ticket: Ticket) {
  form.customerName = ticket.customerName ?? form.customerName
  form.vesselName = ticket.vesselName ?? form.vesselName
  form.customerId = String(ticket.customerId ?? '')
  form.vesselId = String(ticket.vesselId ?? '')
  form.service_category = ticket.service_category
  form.service_title = ticket.service_title
  form.status = ticket.status
  form.priority = ticket.priority
  form.scheduledDate = ticket.scheduledDate ? String(ticket.scheduledDate).slice(0, 10) : ''
  form.notes = ticket.notes ?? ''
  form.planOfAction = (ticket.planOfAction ?? []).map((item) =>
    makePlanItem(item.text ?? '', Boolean(item.completed)),
  )
}

async function loadForEdit() {
  if (!isEditMode.value) return

  const id = editTicketId.value
  await ticketStore.fetchTickets(true)
  let existing = ticketStore.ticketById(id)

  if (!existing) {
    const refreshed = await apiFetch<Ticket[]>('/getAllTickets')
    const normalized = refreshed.map((record) => ({
      ...record,
      id: String(record.id ?? (record as Ticket & { _id?: string })._id ?? ''),
    }))
    existing = normalized.find((record) => record.id === id) ?? null
    if (existing) ticketStore.addTicket(existing)
  }

  if (!existing) throw new Error('Ticket not found')
  hydrateFromTicket(existing)
}

function addPlanItem() {
  form.planOfAction.push(makePlanItem())
}

function removePlanItem(index: number) {
  form.planOfAction.splice(index, 1)
}

async function submit() {
  submitting.value = true
  success.value = false
  error.value = null

  try {
    const payload = {
      ...form,
      planOfAction: form.planOfAction
        .map((item) => ({ ...item, text: item.text.trim() }))
        .filter((item) => item.text.length > 0),
    }

    const saved = isEditMode.value
      ? await apiFetch<Ticket>(`/updateTicket/${encodeURIComponent(editTicketId.value)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await apiFetch<Ticket>('/newTicket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            createdAt: new Date().toISOString(),
            messages: [],
          }),
        })

    ticketStore.addTicket(saved)
    success.value = true
    const savedId = String(saved.id ?? (saved as Ticket & { _id?: string })._id ?? '')
    if (!savedId) {
      throw new Error('Ticket saved, but no ticket id was returned')
    }

    router.push({ name: 'Ticket', query: { id: savedId } })
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
onMounted(async () => {
  try {
    await loadForEdit()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
})
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

.plan-section {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
}

.plan-list {
  display: grid;
  gap: 10px;
}

.plan-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
}

.plan-check {
  width: 18px;
  height: 18px;
}

.plan-input {
  min-width: 0;
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

.immutable {
  background: #f1f5f9;
  color: #64748b;
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

.ghost {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 600;
  cursor: pointer;
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
