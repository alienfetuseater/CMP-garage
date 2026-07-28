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
          <ticket-identity-section
            :form="form"
            :is-edit-mode="isEditMode"
            :existing-note-entries="existingNoteEntries"
            :new-update-note="newUpdateNote"
            @update:new-update-note="newUpdateNote = $event"
          />

          <ticket-assessment-section v-if="isEditMode" :form="form" @error="error = $event" />

          <ticket-execution-section
            v-if="isEditMode"
            :form="form"
            :show-close-out-sections="showCloseOutSections"
            @error="error = $event"
          />

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
import TicketAssessmentSection from '@/components/Ticket/TicketAssessmentSection.vue'
import TicketExecutionSection from '@/components/Ticket/TicketExecutionSection.vue'
import TicketIdentitySection from '@/components/Ticket/TicketIdentitySection.vue'
import { apiFetch } from '@/services/http/client'
import { useTicketStore } from '@/stores/tickets'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import { useUiStore } from '@/stores/ui'
import type { PlanActionItem, RequiredPartItem, Ticket, TicketPhotoAttachment } from '@/types/mock'
import { formatLocalDateTime, toLocalDateKey } from '@/shared/datetime/format'
import { resolveTicketCustomerName, resolveTicketVesselName } from '@/domain/tickets/display'
import { splitNoteHistory } from '@/domain/notes/history'
import { estimateDataUrlBytes } from '@/domain/tickets/photos'

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
const MAX_TICKET_PHOTO_PAYLOAD_BYTES = 12 * 1024 * 1024

const makePlanItem = (text = '', completed = false): PlanActionItem => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  text,
  completed,
})

const makeRequiredPartItem = (text = '', completed = false): RequiredPartItem => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  text,
  completed,
  cost: 0,
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
  initialAssessmentPhotos: [] as TicketPhotoAttachment[],
  recommendedService: '',
  summaryOfWorkPerformed: '',
  summaryOfWorkPerformedPhotos: [] as TicketPhotoAttachment[],
  laborCost: 0,
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
  form.initialAssessmentPhotos = (ticket.initialAssessmentPhotos ?? []).map((photo) => ({
    ...photo,
  }))
  form.recommendedService = ticket.recommendedService ?? ''
  form.summaryOfWorkPerformed = ticket.summaryOfWorkPerformed ?? ''
  form.summaryOfWorkPerformedPhotos = (ticket.summaryOfWorkPerformedPhotos ?? []).map((photo) => ({
    ...photo,
  }))
  form.laborCost = Number(ticket.laborCost ?? 0)
  form.summaryOfFurtherRecommendations = ticket.summaryOfFurtherRecommendations ?? ''
  form.planOfAction = (ticket.planOfAction ?? []).map((item) =>
    makePlanItem(item.text ?? '', Boolean(item.completed)),
  )
  form.requiredParts = (ticket.requiredParts ?? []).map((item) => ({
    ...makeRequiredPartItem(item.text ?? '', Boolean(item.completed)),
    cost: Number(item.cost ?? 0),
  }))
}

async function loadForEdit() {
  if (!isEditMode.value) return

  const id = editTicketId.value
  await uiStore.fetchAllData()

  const fullTicket = await apiFetch<Ticket>(`/getTicketProfile?id=${encodeURIComponent(id)}`)
  const existing = {
    ...fullTicket,
    id: String(fullTicket.id ?? (fullTicket as Ticket & { _id?: string })._id ?? id),
  }
  ticketStore.addTicket(existing)

  if (!existing) throw new Error('Ticket not found')
  hydrateFromTicket(existing)
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

function estimateTicketPhotoPayloadBytes(): number {
  const allPhotos = [...form.initialAssessmentPhotos, ...form.summaryOfWorkPerformedPhotos]
  return allPhotos.reduce((total, photo) => total + estimateDataUrlBytes(photo.dataUrl), 0)
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
        .map((item) => ({
          ...item,
          text: item.text.trim(),
          cost: Number.isFinite(Number(item.cost)) && Number(item.cost) > 0 ? Number(item.cost) : 0,
        }))
        .filter((item) => item.text.length > 0),
      initialAssessment: form.initialAssessment.trim(),
      initialAssessmentPhotos: form.initialAssessmentPhotos.map((photo) => ({ ...photo })),
      recommendedService: form.recommendedService.trim(),
      summaryOfWorkPerformed: form.summaryOfWorkPerformed.trim(),
      summaryOfWorkPerformedPhotos: form.summaryOfWorkPerformedPhotos.map((photo) => ({
        ...photo,
      })),
      laborCost: Number(form.laborCost ?? 0),
      summaryOfFurtherRecommendations: form.summaryOfFurtherRecommendations.trim(),
      notes: isEditMode.value
        ? appendUpdateNote(existingNotes.value, newUpdateNote.value)
        : buildInitialNote(form.notes),
    }

    const estimatedPhotoBytes = estimateTicketPhotoPayloadBytes()
    if (estimatedPhotoBytes > MAX_TICKET_PHOTO_PAYLOAD_BYTES) {
      throw new Error(
        'Too many or too large photos for one ticket. Please remove some photos or upload smaller images.',
      )
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

    const resolvedId =
      saved.id ??
      (saved as Ticket & { _id?: string })._id ??
      (isEditMode.value ? editTicketId.value : '')
    const savedId = String(resolvedId ?? '').trim()
    if (!savedId) {
      throw new Error('Ticket saved, but no ticket id was returned')
    }

    const normalizedSaved: Ticket = {
      ...saved,
      id: savedId,
    }

    ticketStore.addTicket(normalizedSaved)
    success.value = true

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
  border-radius: 999px;
  min-height: 42px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ghost {
  border: 1px solid var(--color-ocean-deep);
  background: var(--color-ocean-muted);
  color: var(--color-ocean-dark);
  border-radius: 999px;
  min-height: 42px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.danger {
  border: 1px solid #991b1b;
  background: #dc2626;
  color: #ffffff;
  border-radius: 999px;
  min-height: 42px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
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
</style>
