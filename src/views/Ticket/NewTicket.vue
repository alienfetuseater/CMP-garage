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

            <div class="photo-actions">
              <button
                type="button"
                class="ghost icon-button"
                aria-label="Browse"
                title="Browse"
                @click="openInitialAssessmentPhotoPicker"
              >
                <svg class="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 16V6M12 6L8.5 9.5M12 6L15.5 9.5M5 15.5V17.5C5 18.6 5.9 19.5 7 19.5H17C18.1 19.5 19 18.6 19 17.5V15.5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class="action-label">Browse</span>
              </button>
              <button
                type="button"
                class="ghost icon-button"
                aria-label="Take photo"
                title="Take photo"
                @click="openInitialAssessmentCameraPicker"
              >
                <svg class="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 8.5C4 7.4 4.9 6.5 6 6.5H8.4L9.5 5H14.5L15.6 6.5H18C19.1 6.5 20 7.4 20 8.5V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V8.5Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="12.5" r="3" stroke="currentColor" stroke-width="1.8" />
                </svg>
                <span class="action-label">Take Photo</span>
              </button>
              <input
                ref="initialAssessmentPhotoInput"
                class="sr-only"
                type="file"
                accept="image/*"
                multiple
                @change="onInitialAssessmentPhotoChange"
              />
              <input
                ref="initialAssessmentCameraInput"
                class="sr-only"
                type="file"
                accept="image/*"
                capture="environment"
                @change="onInitialAssessmentPhotoChange"
              />
            </div>

            <div v-if="form.initialAssessmentPhotos.length" class="photo-grid">
              <figure
                v-for="photo in form.initialAssessmentPhotos"
                :key="photo.id"
                class="photo-card"
              >
                <button
                  type="button"
                  class="photo-remove"
                  title="Remove photo"
                  aria-label="Remove photo"
                  @click="removeInitialAssessmentPhoto(photo.id)"
                >
                  X
                </button>
                <img :src="photo.dataUrl" :alt="photo.name" class="photo-preview" />
                <figcaption class="photo-meta">
                  <label class="photo-caption-label">
                    Photo Caption
                    <input
                      v-model="photo.name"
                      type="text"
                      class="photo-caption-input"
                      placeholder="Brief photo description"
                    />
                  </label>
                  <span>{{ formatLocalDateTime(photo.uploadedAt) }}</span>
                </figcaption>
              </figure>
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
                <div class="currency-field part-cost-input">
                  <span class="currency-prefix">$</span>
                  <input
                    v-model="requiredPartCostInputs[item.id]"
                    type="text"
                    inputmode="decimal"
                    placeholder="0.00"
                    @input="syncRequiredPartCostInput(item.id)"
                    @blur="formatRequiredPartCostInput(item.id)"
                  />
                </div>
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

            <div class="photo-actions">
              <button
                type="button"
                class="ghost icon-button"
                aria-label="Browse"
                title="Browse"
                @click="openSummaryPhotoPicker"
              >
                <svg class="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 16V6M12 6L8.5 9.5M12 6L15.5 9.5M5 15.5V17.5C5 18.6 5.9 19.5 7 19.5H17C18.1 19.5 19 18.6 19 17.5V15.5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class="action-label">Browse</span>
              </button>
              <button
                type="button"
                class="ghost icon-button"
                aria-label="Take photo"
                title="Take photo"
                @click="openSummaryCameraPicker"
              >
                <svg class="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 8.5C4 7.4 4.9 6.5 6 6.5H8.4L9.5 5H14.5L15.6 6.5H18C19.1 6.5 20 7.4 20 8.5V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V8.5Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="12.5" r="3" stroke="currentColor" stroke-width="1.8" />
                </svg>
                <span class="action-label">Take Photo</span>
              </button>
              <input
                ref="summaryOfWorkPhotoInput"
                class="sr-only"
                type="file"
                accept="image/*"
                multiple
                @change="onSummaryPhotoChange"
              />
              <input
                ref="summaryOfWorkCameraInput"
                class="sr-only"
                type="file"
                accept="image/*"
                capture="environment"
                @change="onSummaryPhotoChange"
              />
            </div>

            <div v-if="form.summaryOfWorkPerformedPhotos.length" class="photo-grid">
              <figure
                v-for="photo in form.summaryOfWorkPerformedPhotos"
                :key="photo.id"
                class="photo-card"
              >
                <button
                  type="button"
                  class="photo-remove"
                  title="Remove photo"
                  aria-label="Remove photo"
                  @click="removeSummaryPhoto(photo.id)"
                >
                  X
                </button>
                <img :src="photo.dataUrl" :alt="photo.name" class="photo-preview" />
                <figcaption class="photo-meta">
                  <label class="photo-caption-label">
                    Photo Caption
                    <input
                      v-model="photo.name"
                      type="text"
                      class="photo-caption-input"
                      placeholder="Brief photo description"
                    />
                  </label>
                  <span>{{ formatLocalDateTime(photo.uploadedAt) }}</span>
                </figcaption>
              </figure>
            </div>

            <textarea
              v-model="form.summaryOfWorkPerformed"
              rows="5"
              placeholder="Enter summary of work performed"
            />
          </section>

          <section v-if="isEditMode" class="plan-section invoice-section">
            <div class="section-heading">
              <h3>Invoice Cost</h3>
              <p>Total of selected required parts plus labor cost.</p>
            </div>

            <label class="invoice-labor">
              Labor Cost
              <div class="currency-field">
                <span class="currency-prefix">$</span>
                <input
                  v-model="laborCostInput"
                  type="text"
                  inputmode="decimal"
                  placeholder="0.00"
                  @input="syncLaborCostInput"
                  @blur="formatLaborCostInput"
                />
              </div>
            </label>

            <div class="invoice-summary">
              <p><strong>Selected Parts Total</strong> {{ formatCurrency(selectedPartsTotal) }}</p>
              <p><strong>Labor Cost</strong> {{ formatCurrency(normalizedLaborCost) }}</p>
              <p class="invoice-grand-total">
                <strong>Invoice Total</strong> {{ formatCurrency(invoiceTotal) }}
              </p>
            </div>
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
import type { PlanActionItem, RequiredPartItem, Ticket, TicketPhotoAttachment } from '@/types/mock'
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
const initialAssessmentPhotoInput = ref<HTMLInputElement | null>(null)
const initialAssessmentCameraInput = ref<HTMLInputElement | null>(null)
const summaryOfWorkPhotoInput = ref<HTMLInputElement | null>(null)
const summaryOfWorkCameraInput = ref<HTMLInputElement | null>(null)
const requiredPartCostInputs = ref<Record<string, string>>({})
const laborCostInput = ref('0.00')
const MAX_TICKET_PHOTO_WIDTH = 1600
const MAX_TICKET_PHOTO_HEIGHT = 1200
const TICKET_PHOTO_JPEG_QUALITY = 0.82
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0)
}

const makeTicketPhotoAttachment = (
  name: string,
  dataUrl: string,
  uploadedAt = new Date().toISOString(),
): TicketPhotoAttachment => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  name,
  uploadedAt,
  dataUrl,
})

const derivePhotoCaption = (filename: string) => {
  const cleaned = String(filename || '').trim()
  if (!cleaned) return 'Ticket Photo'
  const noExtension = cleaned.replace(/\.[a-z0-9]+$/i, '').trim()
  return noExtension || cleaned
}

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

const selectedPartsTotal = computed(() => {
  return form.requiredParts.reduce((total, item) => {
    if (!item.completed) return total
    const cost = Number(item.cost ?? 0)
    if (!Number.isFinite(cost) || cost <= 0) return total
    return total + cost
  }, 0)
})

const normalizedLaborCost = computed(() => {
  const value = Number(form.laborCost ?? 0)
  if (!Number.isFinite(value) || value < 0) return 0
  return value
})

const invoiceTotal = computed(() => selectedPartsTotal.value + normalizedLaborCost.value)

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
  hydrateRequiredPartCostInputs()
  laborCostInput.value = formatCurrencyInputValue(form.laborCost)
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
  const item = makeRequiredPartItem()
  form.requiredParts.push(item)
  requiredPartCostInputs.value[item.id] = formatCurrencyInputValue(item.cost)
}

function removeRequiredPartItem(index: number) {
  const [removed] = form.requiredParts.splice(index, 1)
  if (removed?.id) delete requiredPartCostInputs.value[removed.id]
}

function sanitizeCurrencyInput(raw: string) {
  const cleaned = String(raw ?? '').replace(/[^\d.]/g, '')
  const firstDotIndex = cleaned.indexOf('.')
  if (firstDotIndex < 0) return cleaned

  const whole = cleaned.slice(0, firstDotIndex)
  const decimals = cleaned
    .slice(firstDotIndex + 1)
    .replace(/\./g, '')
    .slice(0, 2)

  return `${whole}.${decimals}`
}

function parseCurrencyInputValue(raw: string) {
  const normalized = sanitizeCurrencyInput(raw)
  const parsed = Number.parseFloat(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.round(parsed * 100) / 100
}

function formatCurrencyInputValue(value: number | undefined) {
  const numeric = Number(value ?? 0)
  if (!Number.isFinite(numeric) || numeric < 0) return '0.00'
  return numeric.toFixed(2)
}

function syncRequiredPartCostInput(partId: string) {
  const raw = requiredPartCostInputs.value[partId] ?? ''
  requiredPartCostInputs.value[partId] = sanitizeCurrencyInput(raw)

  const part = form.requiredParts.find((item) => item.id === partId)
  if (!part) return
  part.cost = parseCurrencyInputValue(requiredPartCostInputs.value[partId])
}

function formatRequiredPartCostInput(partId: string) {
  const part = form.requiredParts.find((item) => item.id === partId)
  const numeric = part
    ? Number(part.cost ?? 0)
    : parseCurrencyInputValue(requiredPartCostInputs.value[partId])
  requiredPartCostInputs.value[partId] = formatCurrencyInputValue(numeric)
  if (part) part.cost = parseCurrencyInputValue(requiredPartCostInputs.value[partId])
}

function syncLaborCostInput() {
  laborCostInput.value = sanitizeCurrencyInput(laborCostInput.value)
  form.laborCost = parseCurrencyInputValue(laborCostInput.value)
}

function formatLaborCostInput() {
  laborCostInput.value = formatCurrencyInputValue(form.laborCost)
  form.laborCost = parseCurrencyInputValue(laborCostInput.value)
}

function hydrateRequiredPartCostInputs() {
  const next: Record<string, string> = {}
  form.requiredParts.forEach((item) => {
    next[item.id] = formatCurrencyInputValue(item.cost)
  })
  requiredPartCostInputs.value = next
}

function removeInitialAssessmentPhoto(photoId: string) {
  form.initialAssessmentPhotos = form.initialAssessmentPhotos.filter(
    (photo) => photo.id !== photoId,
  )
}

function removeSummaryPhoto(photoId: string) {
  form.summaryOfWorkPerformedPhotos = form.summaryOfWorkPerformedPhotos.filter(
    (photo) => photo.id !== photoId,
  )
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

function openInitialAssessmentPhotoPicker() {
  initialAssessmentPhotoInput.value?.click()
}

function openInitialAssessmentCameraPicker() {
  initialAssessmentCameraInput.value?.click()
}

function openSummaryPhotoPicker() {
  summaryOfWorkPhotoInput.value?.click()
}

function openSummaryCameraPicker() {
  summaryOfWorkCameraInput.value?.click()
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') resolve(result)
      else reject(new Error('Failed to read image file'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image preview'))
    image.src = dataUrl
  })
}

async function resizeImageFile(file: File): Promise<string> {
  const sourceDataUrl = await readFileAsDataUrl(file)
  const image = await loadImageElement(sourceDataUrl)

  const widthRatio = MAX_TICKET_PHOTO_WIDTH / image.width
  const heightRatio = MAX_TICKET_PHOTO_HEIGHT / image.height
  const scale = Math.min(1, widthRatio, heightRatio)

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Failed to process image upload')
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/jpeg', TICKET_PHOTO_JPEG_QUALITY)
}

function estimateDataUrlBytes(dataUrl: string): number {
  const base64Index = dataUrl.indexOf(',')
  if (base64Index < 0) return 0
  const base64Length = dataUrl.length - (base64Index + 1)
  return Math.floor((base64Length * 3) / 4)
}

function estimateTicketPhotoPayloadBytes(): number {
  const allPhotos = [...form.initialAssessmentPhotos, ...form.summaryOfWorkPerformedPhotos]
  return allPhotos.reduce((total, photo) => total + estimateDataUrlBytes(photo.dataUrl), 0)
}

async function appendPhotos(
  files: FileList | null,
  target: 'initialAssessmentPhotos' | 'summaryOfWorkPerformedPhotos',
  input: HTMLInputElement | null,
) {
  if (!files?.length) return

  const nextPhotos = await Promise.all(
    Array.from(files).map(async (file) => {
      const dataUrl = await resizeImageFile(file)
      return makeTicketPhotoAttachment(derivePhotoCaption(file.name), dataUrl)
    }),
  )

  form[target] = [...form[target], ...nextPhotos]
  if (input) input.value = ''
}

async function onInitialAssessmentPhotoChange(event: Event) {
  const input = event.target as HTMLInputElement | null
  try {
    await appendPhotos(input?.files ?? null, 'initialAssessmentPhotos', input)
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
}

async function onSummaryPhotoChange(event: Event) {
  const input = event.target as HTMLInputElement | null
  try {
    await appendPhotos(input?.files ?? null, 'summaryOfWorkPerformedPhotos', input)
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
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
    syncLaborCostInput()

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
      laborCost: normalizedLaborCost.value,
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
  grid-template-columns: auto 1fr minmax(110px, 160px) auto;
  gap: 10px;
  align-items: center;
}

.part-cost-input {
  min-width: 0;
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

.photo-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.action-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
}

.action-label {
  display: inline;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.photo-grid {
  --ticket-photo-tile-width: 260px;
  --ticket-photo-tile-height: 195px;
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--ticket-photo-tile-width));
  gap: 12px;
  justify-content: flex-start;
}

.photo-card {
  position: relative;
  margin: 0;
  padding: 10px;
  width: var(--ticket-photo-tile-width);
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
}

.photo-preview {
  display: block;
  width: var(--ticket-photo-tile-width);
  height: var(--ticket-photo-tile-height);
  object-fit: cover;
  border-radius: 12px;
  background: #e2e8f0;
}

.photo-meta {
  display: grid;
  gap: 4px;
  margin-top: 8px;
  color: #475569;
  font-size: 0.9rem;
}

.photo-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(15, 23, 42, 0.25);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.7);
  color: #ffffff;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.photo-remove:hover {
  background: rgba(127, 29, 29, 0.92);
}

.photo-caption-label {
  display: grid;
  gap: 6px;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.photo-caption-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 10px;
  font: inherit;
  color: #0f172a;
  background: #ffffff;
}

.invoice-section {
  gap: 14px;
}

.invoice-labor {
  max-width: 260px;
}

.currency-field {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  padding-left: 12px;
}

.currency-prefix {
  color: #475569;
  font-weight: 700;
  margin-right: 6px;
}

.currency-field input {
  border: none;
  background: transparent;
  padding-left: 0;
}

.currency-field input:focus {
  outline: none;
}

.invoice-summary {
  display: grid;
  gap: 6px;
  color: #334155;
}

.invoice-summary p {
  margin: 0;
}

.invoice-grand-total {
  margin-top: 4px;
  font-size: 1.02rem;
  color: #0f172a;
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

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .plan-row {
    grid-template-columns: auto 1fr;
  }

  .part-cost-input,
  .plan-row .ghost {
    grid-column: 1 / -1;
  }

  .photo-grid {
    grid-template-columns: 1fr;
  }

  .icon-button {
    width: 42px;
    min-width: 42px;
    padding: 0;
    justify-content: center;
  }

  .action-icon {
    width: 20px;
    height: 20px;
    flex-basis: 20px;
  }

  .action-label {
    display: none;
  }

  .photo-card,
  .photo-preview {
    width: 100%;
  }

  .photo-preview {
    height: auto;
    aspect-ratio: 4 / 3;
  }
}
</style>
