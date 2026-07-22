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

        <form class="ticket-form" @submit.prevent="submit()">
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

            <!-- <label>
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
            </label> -->

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

          <label v-if="!isEditMode">
            Notes
            <textarea v-model="form.notes" rows="5" />
          </label>

          <section v-else class="plan-section">
            <div class="section-heading">
              <h3>Notes History</h3>
              <p>Previous notes are read-only. Add a fresh update note below.</p>
            </div>

            <div v-if="existingNoteEntries.length" class="notes-stack">
              <div
                v-for="(entry, index) in existingNoteEntries"
                :key="index"
                class="immutable-notes"
              >
                {{ entry }}
              </div>
            </div>
            <div v-else class="empty-state">No previous notes yet.</div>

            <label>
              New Update Note
              <textarea
                v-model="newUpdateNote"
                rows="4"
                placeholder="Add a fresh update note for this work order"
              />
            </label>
          </section>

          <section v-if="isEditMode" class="plan-section">
            <div class="section-heading">
              <h3>Initial Assessment</h3>
              <p>Capture the first assessment notes for this service ticket.</p>
            </div>

            <textarea
              v-model="form.initialAssessment"
              rows="4"
              placeholder="Enter initial assessment notes"
            />
          </section>

          <section v-if="isEditMode" class="plan-section">
            <div class="section-heading">
              <h3>Recommended Service</h3>
              <p>Document recommended service notes based on findings.</p>
            </div>

            <textarea
              v-model="form.recommendedService"
              rows="4"
              placeholder="Enter recommended service notes"
            />
          </section>

          <section v-if="isEditMode" class="plan-section">
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

          <section v-if="isEditMode" class="plan-section">
            <div class="section-heading">
              <h3>Required Parts</h3>
              <p>Add required parts and check them off as they are acquired or installed.</p>
            </div>

            <div class="plan-list">
              <div v-for="(item, index) in form.requiredParts" :key="item.id" class="plan-row">
                <input v-model="item.completed" type="checkbox" class="plan-check" />
                <input v-model="item.text" class="plan-input" placeholder="Part name" />
                <button type="button" class="ghost" @click="removeRequiredPartItem(index)">
                  Remove
                </button>
              </div>
            </div>

            <button type="button" class="ghost" @click="addRequiredPartItem">
              Add Required Part
            </button>
          </section>

          <section v-if="isEditMode" class="plan-section">
            <div class="section-heading">
              <h3>Summary of Work Completed</h3>
              <p>Describe the work completed on this ticket.</p>
            </div>

            <textarea
              v-model="form.summaryOfWorkPerformed"
              rows="5"
              placeholder="Enter summary of work performed"
            />
          </section>

          <section v-if="isEditMode && showCloseOutSections" class="plan-section">
            <div class="section-heading">
              <h3>Summary of Further Recommendations</h3>
              <p>Document any recommendations for future service.</p>
            </div>

            <textarea
              v-model="form.summaryOfFurtherRecommendations"
              rows="5"
              placeholder="Enter summary of further recommendations"
            />
          </section>

          <div class="actions">
            <button type="submit" class="primary" :disabled="submitting">
              {{ isEditMode ? 'Update Ticket' : 'Create Ticket' }}
            </button>
            <button
              v-if="isEditMode && showCloseOutSections"
              type="button"
              class="danger"
              :disabled="submitting || !canFinalizeCloseOut"
              @click="finalizeCloseOut"
            >
              Close Ticket - Final
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
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import { useUiStore } from '@/stores/ui'
import type { PlanActionItem, RequiredPartItem, Ticket } from '@/types/mock'
import { formatLocalDateTime, toLocalDateKey } from '@/utils/datetime'
import { resolveTicketCustomerName, resolveTicketVesselName } from '@/utils/ticketDisplay'
import { splitNoteHistory } from '@/utils/notes'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const ticketStore = useTicketStore()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()

const submitting = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const editTicketId = computed(() => String(route.query.id || ''))
const isEditMode = computed(() => Boolean(editTicketId.value))
const existingNotes = ref('')
const newUpdateNote = ref('')
const existingNoteEntries = computed(() => splitNoteHistory(existingNotes.value))
const showCloseOutSections = ref(false)

const makePlanItem = (text = '', completed = false): PlanActionItem => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  text,
  completed,
})

const makeRequiredPartItem = (text = '', completed = false): RequiredPartItem => ({
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
  initialAssessment: '',
  recommendedService: '',
  summaryOfWorkPerformed: '',
  summaryOfFurtherRecommendations: '',
  planOfAction: [] as PlanActionItem[],
  requiredParts: [] as RequiredPartItem[],
})

const canFinalizeCloseOut = computed(() => {
  if (!showCloseOutSections.value) return false
  return (
    form.summaryOfWorkPerformed.trim().length > 0 &&
    form.summaryOfFurtherRecommendations.trim().length > 0
  )
})

function hydrateFromQuery() {
  const vesselId = String(route.query.vesselId || '')
  const customerId = String(route.query.customerId || '')
  const customerName = String(route.query.customerName || '')
  const vesselName = String(route.query.vesselName || '')
  const closeOut = String(route.query.closeOut || '')

  if (vesselId) form.vesselId = vesselId
  if (customerId) form.customerId = customerId
  if (customerName) form.customerName = customerName
  if (vesselName) form.vesselName = vesselName
  if (closeOut === '1' || closeOut.toLowerCase() === 'true') {
    showCloseOutSections.value = true
  }
}

function hydrateFromTicket(ticket: Ticket) {
  form.customerName = resolveTicketCustomerName(ticket, customerStore.customers)
  form.vesselName = resolveTicketVesselName(ticket, vesselStore.vessels)
  form.customerId = String(ticket.customerId ?? '')
  form.vesselId = String(ticket.vesselId ?? '')
  form.service_category = ticket.service_category
  form.service_title = ticket.service_title
  form.status = ticket.status
  form.priority = ticket.priority
  form.scheduledDate = ticket.scheduledDate ? toLocalDateKey(ticket.scheduledDate) : ''
  existingNotes.value = ticket.notes ?? ''
  newUpdateNote.value = ''
  form.notes = ''
  form.initialAssessment = ticket.initialAssessment ?? ''
  form.recommendedService = ticket.recommendedService ?? ''
  form.summaryOfWorkPerformed = ticket.summaryOfWorkPerformed ?? ''
  form.summaryOfFurtherRecommendations = ticket.summaryOfFurtherRecommendations ?? ''
  form.planOfAction = (ticket.planOfAction ?? []).map((item) =>
    makePlanItem(item.text ?? '', Boolean(item.completed)),
  )
  form.requiredParts = (ticket.requiredParts ?? []).map((item) =>
    makeRequiredPartItem(item.text ?? '', Boolean(item.completed)),
  )
}

async function loadForEdit() {
  if (!isEditMode.value) return

  const id = editTicketId.value
  await uiStore.fetchAllData()
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

function addRequiredPartItem() {
  form.requiredParts.push(makeRequiredPartItem())
}

function removeRequiredPartItem(index: number) {
  form.requiredParts.splice(index, 1)
}

function appendUpdateNote(previousNotes: string, noteText: string): string {
  const trimmed = noteText.trim()
  if (!trimmed) return previousNotes

  const entry = `[${formatLocalDateTime(new Date())}] ${trimmed}`
  return previousNotes ? `${previousNotes}\n\n${entry}` : entry
}

function buildInitialNote(noteText: string): string {
  const trimmed = noteText.trim()
  if (!trimmed) return ''
  return `[${formatLocalDateTime(new Date())}] ${trimmed}`
}

async function finalizeCloseOut() {
  if (!canFinalizeCloseOut.value) {
    error.value = 'Please complete both close-out summary sections before finalizing.'
    return
  }

  await submit({ forceClosed: true })
}

async function submit(options?: { forceClosed?: boolean }) {
  submitting.value = true
  success.value = false
  error.value = null

  try {
    const forceClosed = Boolean(options?.forceClosed)

    const payload = {
      ...form,
      status: forceClosed ? 'closed' : form.status,
      planOfAction: form.planOfAction
        .map((item) => ({ ...item, text: item.text.trim() }))
        .filter((item) => item.text.length > 0),
      requiredParts: form.requiredParts
        .map((item) => ({ ...item, text: item.text.trim() }))
        .filter((item) => item.text.length > 0),
      initialAssessment: form.initialAssessment.trim(),
      recommendedService: form.recommendedService.trim(),
      summaryOfWorkPerformed: form.summaryOfWorkPerformed.trim(),
      summaryOfFurtherRecommendations: form.summaryOfFurtherRecommendations.trim(),
      notes: isEditMode.value
        ? appendUpdateNote(existingNotes.value, newUpdateNote.value)
        : buildInitialNote(form.notes),
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
  position: relative;
  margin-block: 0;
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
  color: var(--color-ocean-dark);
  cursor: pointer;
  position: absolute;
  top: 6px;
  right: calc(100% + 16px);
  margin-bottom: 0;
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

.section-heading h3 {
  margin: 0;
  color: #0f172a;
}

.section-heading p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.95rem;
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

.immutable-notes {
  padding: 12px 14px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  white-space: pre-wrap;
}

.notes-stack {
  display: grid;
  gap: 10px;
}

.empty-state {
  color: #64748b;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.primary {
  border: 1px solid var(--color-ocean-deep);
  background: var(--color-ocean-dark);
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

.danger {
  border: 1px solid #991b1b;
  background: #dc2626;
  color: #ffffff;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
}

.danger:disabled,
.ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
}

.success {
  color: #059669;
}

@media (max-width: 1100px) {
  .back {
    position: static;
    margin-bottom: 12px;
  }
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
