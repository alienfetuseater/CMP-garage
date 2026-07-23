<template>
  <main class="ticket-page">
    <div class="ticket-shell">
      <button class="back" @click="goBack">← Back</button>

      <div v-if="loading" class="status-card">Loading...</div>
      <div v-else-if="error" class="status-card error">{{ error }}</div>

      <section v-else-if="ticket" class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">Ticket profile</p>
            <h2>{{ ticket.service_title }}</h2>
          </div>

          <div class="header-actions">
            <div class="ticket-badge">{{ ticket.status }}</div>
            <button type="button" class="secondary" :disabled="isTicketClosed" @click="editWork">
              Update Work
            </button>
            <button v-if="!isTicketClosed" type="button" class="secondary" @click="closeOutTicket">
              Close Out Ticket
            </button>
            <button
              v-else
              type="button"
              class="secondary"
              :disabled="updatingTicketStatus"
              @click="reopenTicket"
            >
              Reopen Ticket
            </button>
            <button
              type="button"
              class="secondary"
              @click="emailUpdatedProgress"
              :disabled="emailingProgress"
            >
              {{ isTicketClosed ? 'Email Final Invoice to Client' : 'Email Updated Progress' }}
            </button>
            <span v-if="updatingTicketStatus">Updating status...</span>
            <span v-if="ticketStatusError" class="error">{{ ticketStatusError }}</span>
            <span v-if="emailingProgress">Emailing...</span>
            <span v-if="emailProgressSuccess" class="success">{{ emailProgressSuccess }}</span>
            <span v-if="emailProgressError" class="error">{{ emailProgressError }}</span>
          </div>
        </header>

        <div class="owner-strip">
          <span class="owner-label">Customer</span>
          <span class="clickable owner owner-link" @click="openCustomer">
            {{ customerName }}
          </span>
          <span class="owner-divider">•</span>
          <span class="owner-label">Vessel</span>
          <span class="clickable owner owner-link" @click="openVessel">
            {{ vesselName }}
          </span>
        </div>

        <ul class="details">
          <li><strong>Status</strong> {{ ticket.status }}</li>
          <li><strong>Priority</strong> {{ ticket.priority }}</li>
          <li><strong>Created</strong> {{ formatLocalDateTime(ticket.createdAt) }}</li>
          <li><strong>Scheduled</strong> {{ formatLocalDateTime(ticket.scheduledDate) }}</li>
        </ul>

        <section class="notes-block">
          <div class="section-heading">
            <h3>Initial Assessment</h3>
          </div>

          <p v-if="initialAssessmentText" class="notes-text">{{ initialAssessmentText }}</p>
          <div v-if="initialAssessmentPhotos.length" class="photo-grid">
            <figure v-for="photo in initialAssessmentPhotos" :key="photo.id" class="photo-card">
              <img :src="photo.dataUrl" :alt="photo.name" class="photo-preview" />
              <figcaption class="photo-meta">
                <span>{{ photo.name?.trim() || 'Ticket Photo' }}</span>
                <span>{{ formatLocalDateTime(photo.uploadedAt) }}</span>
              </figcaption>
            </figure>
          </div>
          <div v-if="!initialAssessmentText && !initialAssessmentPhotos.length" class="empty-state">
            No initial assessment provided for this ticket.
          </div>
        </section>

        <section class="notes-block">
          <div class="section-heading">
            <h3>Recommended Service</h3>
          </div>

          <p v-if="recommendedServiceText" class="notes-text">{{ recommendedServiceText }}</p>
          <div v-else class="empty-state">No recommended service provided for this ticket.</div>
        </section>

        <section class="plan-block">
          <div class="section-heading">
            <h3>Plan of Action</h3>
            <p>
              {{ completedPlanCount }} of {{ totalPlanCount }} items complete ({{ planProgress }}%)
            </p>
          </div>

          <div v-if="totalPlanCount > 0" class="plan-items">
            <label v-for="item in planItems" :key="item.id" class="plan-item">
              <input type="checkbox" :checked="item.completed" disabled />
              <span :class="{ done: item.completed }">{{ item.text }}</span>
            </label>
          </div>
          <div v-else class="empty-state">No plan items have been added to this ticket yet.</div>
        </section>

        <section class="plan-block">
          <div class="section-heading">
            <h3>Required Parts</h3>
            <p>
              {{ completedRequiredParts }} of {{ totalRequiredParts }} parts complete ({{
                requiredPartsProgress
              }}%)
            </p>
          </div>

          <div v-if="totalRequiredParts > 0" class="plan-items">
            <label v-for="part in requiredParts" :key="part.id" class="plan-item">
              <input type="checkbox" :checked="part.completed" disabled />
              <span :class="{ done: part.completed }">{{ part.text }}</span>
              <span class="part-cost">{{ formatCurrency(part.cost ?? 0) }}</span>
            </label>
          </div>
          <div v-else class="empty-state">
            No required parts have been added to this ticket yet.
          </div>
        </section>

        <section class="notes-block">
          <div class="section-heading">
            <h3>Notes</h3>
          </div>

          <div v-if="noteEntries.length" class="notes-stack">
            <div v-for="(entry, index) in noteEntries" :key="index" class="notes-card">
              {{ entry }}
            </div>
          </div>
          <div v-else class="empty-state">No notes provided for this ticket.</div>
        </section>

        <section class="notes-block">
          <div class="section-heading">
            <h3>Summary of Work Completed</h3>
          </div>

          <p v-if="summaryOfWorkCompletedText" class="notes-text">
            {{ summaryOfWorkCompletedText }}
          </p>
          <div v-if="summaryOfWorkCompletedPhotos.length" class="photo-grid">
            <figure
              v-for="photo in summaryOfWorkCompletedPhotos"
              :key="photo.id"
              class="photo-card"
            >
              <img :src="photo.dataUrl" :alt="photo.name" class="photo-preview" />
              <figcaption class="photo-meta">
                <span>{{ photo.name?.trim() || 'Ticket Photo' }}</span>
                <span>{{ formatLocalDateTime(photo.uploadedAt) }}</span>
              </figcaption>
            </figure>
          </div>
          <div
            v-if="!summaryOfWorkCompletedText && !summaryOfWorkCompletedPhotos.length"
            class="empty-state"
          >
            No summary of work completed provided for this ticket.
          </div>
        </section>

        <section class="notes-block invoice-block">
          <div class="section-heading">
            <h3>Invoice Cost</h3>
            <p>Total of selected required parts plus labor cost.</p>
          </div>

          <div class="invoice-summary">
            <p><strong>Selected Parts Total</strong> {{ formatCurrency(selectedPartsTotal) }}</p>
            <p><strong>Labor Cost</strong> {{ formatCurrency(normalizedLaborCost) }}</p>
            <p class="invoice-grand-total">
              <strong>Invoice Total</strong> {{ formatCurrency(invoiceTotal) }}
            </p>
          </div>
        </section>

        <section class="diagnostics-section">
          <div class="section-heading diagnostics-heading">
            <div>
              <h3>Diagnostics</h3>
              <p>Fill out the inspection details here after the ticket has been created.</p>
            </div>

            <fieldset class="diagnostics-toggle">
              <legend>Show diagnostics form</legend>
              <label>
                <input v-model="showDiagnostics" type="radio" :value="false" />
                Hide
              </label>
              <label>
                <input v-model="showDiagnostics" type="radio" :value="true" />
                Show
              </label>
            </fieldset>
          </div>

          <div v-if="showDiagnostics" class="diagnostics-form">
            <div
              v-for="section in diagnosticSections"
              :key="section.title"
              class="diagnostic-group"
            >
              <div class="diagnostic-group-header">
                <h4>{{ section.title }}</h4>
              </div>

              <div class="diagnostics-grid">
                <label v-for="field in section.fields" :key="field.key">
                  {{ field.label }}
                  <select v-model="diagnostics[field.key]">
                    <option value="good">good</option>
                    <option value="monitor">monitor</option>
                    <option value="action">action</option>
                    <option value="N/A">N/A</option>
                  </select>
                </label>
              </div>
            </div>

            <div class="diagnostics-footer">
              <button
                type="button"
                class="primary diagnostics-save"
                @click="saveDiagnostics"
                :disabled="savingDiagnostics"
              >
                Save Diagnostics
              </button>
              <span v-if="savingDiagnostics">Saving...</span>
              <span v-if="diagnosticsSuccess" class="success">Saved</span>
              <span v-if="diagnosticsError" class="error">{{ diagnosticsError }}</span>
            </div>
          </div>
        </section>
      </section>

      <div v-else class="status-card">No ticket found.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useTicketStore } from '@/stores/tickets'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import { apiFetch } from '@/api'
import type {
  DiagnosticLevel,
  PlanActionItem,
  RequiredPartItem,
  Ticket,
  TicketPhotoAttachment,
} from '@/types/mock'
import { formatLocalDateTime } from '@/utils/datetime'
import { splitNoteHistory } from '@/utils/notes'

const uiStore = useUiStore()
const ticketStore = useTicketStore()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
const route = useRoute()
const router = useRouter()
const ticket = ref<Ticket | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const customerName = ref<string | null>(null)
const vesselName = ref<string | null>(null)

const savingDiagnostics = ref(false)
const diagnosticsSuccess = ref(false)
const diagnosticsError = ref<string | null>(null)
const showDiagnostics = ref(false)
const emailingProgress = ref(false)
const emailProgressSuccess = ref<string | null>(null)
const emailProgressError = ref<string | null>(null)
const updatingTicketStatus = ref(false)
const ticketStatusError = ref<string | null>(null)

const diagnosticSections = [
  {
    title: 'Engine and Drive',
    fields: [
      { key: 'engine_oil', label: 'Engine oil level and condition' },
      { key: 'gear_lube', label: 'Gear lube' },
      { key: 'fuel_system', label: 'Fuel system' },
      { key: 'cooling_system', label: 'Cooling system' },
      { key: 'propeller_hardware', label: 'Propeller hardware' },
      { key: 'anodes_engine_drive', label: 'Anodes engine drive' },
      { key: 'belts_hoses', label: 'Belts and hoses' },
      { key: 'steering_engine_mount_hardware', label: 'Steering and engine mount hardware' },
    ],
  },
  {
    title: 'Electrical and Batteries',
    fields: [
      { key: 'battery_voltage', label: 'Battery voltage and load test' },
      { key: 'terminals_connections', label: 'Terminals and connections' },
      { key: 'charger_shore_power', label: 'Charger and shore power' },
      { key: 'bilge_pump', label: 'Bilge pump' },
      { key: 'navigation_anchorLights', label: 'Navigation and anchor lights' },
      { key: 'ham_electronics_powerUp', label: 'Helm electronics and power up' },
    ],
  },
  {
    title: 'Hull and Exterior',
    fields: [
      { key: 'hull_gellcoat', label: 'Hull and gelcoat' },
      { key: 'throughHull_seacocks', label: 'Through-hull and seacocks' },
      { key: 'hull_trimTab_anodes', label: 'Hull and trim tab anodes' },
      { key: 'bottom_paint_growth', label: 'Bottom paint and growth' },
      { key: 'trim_tabs_operation', label: 'Trim tabs operation' },
    ],
  },
  {
    title: 'Lift and Mooring',
    fields: [
      { key: 'liftCables_pulleys', label: 'Lift cables and pulleys' },
      { key: 'liftMotors_switches', label: 'Lift motors and switches' },
      { key: 'bunks_guidePosts', label: 'Bunks and guide posts' },
      { key: 'dockLines_chafePoints', label: 'Dock lines and chafe points' },
    ],
  },
  {
    title: 'Onboard Systems',
    fields: [
      { key: 'steeringFluid_operation', label: 'Steering fluid and operation' },
      { key: 'liveWell_washdownPumps', label: 'Live well and washdown pumps' },
      { key: 'freshwater_system', label: 'Freshwater system' },
      { key: 'head_waste_system', label: 'Head and waste system' },
    ],
  },
  {
    title: 'Deck and Interior',
    fields: [
      { key: 'hatches_latches_drains', label: 'Hatches, latches and drains' },
      { key: 'upholstery_canvas', label: 'Upholstery and canvas' },
      { key: 'safety_equipment_check', label: 'Safety equipment check' },
    ],
  },
] as const

const diagnosticFields = diagnosticSections.flatMap((section) =>
  section.fields.map((field) => field.key),
)

const diagnostics = reactive<Record<(typeof diagnosticFields)[number], DiagnosticLevel>>(
  diagnosticFields.reduce(
    (accumulator, field) => {
      accumulator[field] = 'N/A'
      return accumulator
    },
    {} as Record<(typeof diagnosticFields)[number], DiagnosticLevel>,
  ),
)

const planItems = computed<PlanActionItem[]>(() => ticket.value?.planOfAction ?? [])
const totalPlanCount = computed(() => planItems.value.length)
const completedPlanCount = computed(() => planItems.value.filter((item) => item.completed).length)
const planProgress = computed(() => {
  if (!totalPlanCount.value) return 0
  return Math.round((completedPlanCount.value / totalPlanCount.value) * 100)
})

const requiredParts = computed<RequiredPartItem[]>(() => ticket.value?.requiredParts ?? [])
const totalRequiredParts = computed(() => requiredParts.value.length)
const completedRequiredParts = computed(
  () => requiredParts.value.filter((item) => item.completed).length,
)
const requiredPartsProgress = computed(() => {
  if (!totalRequiredParts.value) return 0
  return Math.round((completedRequiredParts.value / totalRequiredParts.value) * 100)
})

const initialAssessmentText = computed(() => ticket.value?.initialAssessment?.trim() ?? '')
const recommendedServiceText = computed(() => ticket.value?.recommendedService?.trim() ?? '')
const summaryOfWorkCompletedText = computed(
  () => ticket.value?.summaryOfWorkPerformed?.trim() ?? '',
)
const initialAssessmentPhotos = computed<TicketPhotoAttachment[]>(
  () => ticket.value?.initialAssessmentPhotos ?? [],
)
const summaryOfWorkCompletedPhotos = computed<TicketPhotoAttachment[]>(
  () => ticket.value?.summaryOfWorkPerformedPhotos ?? [],
)
const noteEntries = computed(() => splitNoteHistory(ticket.value?.notes))
const normalizedLaborCost = computed(() => {
  const value = Number(ticket.value?.laborCost ?? 0)
  if (!Number.isFinite(value) || value < 0) return 0
  return value
})
const selectedPartsTotal = computed(() => {
  return requiredParts.value.reduce((total, item) => {
    if (!item.completed) return total
    const cost = Number(item.cost ?? 0)
    if (!Number.isFinite(cost) || cost <= 0) return total
    return total + cost
  }, 0)
})
const invoiceTotal = computed(() => selectedPartsTotal.value + normalizedLaborCost.value)
const isTicketClosed = computed(() => {
  const status = String(ticket.value?.status || '')
    .trim()
    .toLowerCase()
  return status === 'closed'
})

async function load() {
  loading.value = true
  error.value = null
  try {
    const id = String(route.query.id || '')
    if (!id) throw new Error('No ticket id provided')

    await uiStore.fetchAllData()

    const fullTicket = await apiFetch<Ticket>(`/getTicketProfile?id=${encodeURIComponent(id)}`)
    const normalizedTicket = {
      ...fullTicket,
      id: String(fullTicket.id ?? (fullTicket as Ticket & { _id?: string })._id ?? id),
    }
    ticketStore.addTicket(normalizedTicket)
    ticket.value = normalizedTicket

    if (!ticket.value) {
      throw new Error('Ticket not found')
    }

    hydrateDiagnostics()

    const customers = customerStore.customers
    const vessels = vesselStore.vessels

    const cid = ticket.value.customerId
    const c = customers.find((x) => x.id === cid)
    customerName.value = c ? c.name : cid

    const vid = ticket.value.vesselId
    const v = vessels.find((x) => x.id === vid)
    vesselName.value = v ? v.vesselName : vid
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

function hydrateDiagnostics() {
  const currentDiagnostics = ticket.value?.diagnostics ?? {}

  diagnosticFields.forEach((field) => {
    diagnostics[field] = currentDiagnostics[field] ?? 'N/A'
  })

  showDiagnostics.value = false
}

async function saveDiagnostics() {
  if (!ticket.value) return

  savingDiagnostics.value = true
  diagnosticsSuccess.value = false
  diagnosticsError.value = null

  try {
    const payload = {
      diagnostics: Object.fromEntries(diagnosticFields.map((field) => [field, diagnostics[field]])),
    }

    const saved = await apiFetch<Ticket>(`/updateTicket/${ticket.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    ticket.value = saved
    ticketStore.addTicket(saved)
    diagnosticsSuccess.value = true
  } catch (err) {
    diagnosticsError.value = err instanceof Error ? err.message : String(err)
  } finally {
    savingDiagnostics.value = false
  }
}

async function emailUpdatedProgress() {
  if (!ticket.value) return

  emailingProgress.value = true
  emailProgressSuccess.value = null
  emailProgressError.value = null

  try {
    const response = await apiFetch<{ message: string; recipient: string }>(
      `/emailTicketProgress/${encodeURIComponent(ticket.value.id)}`,
      {
        method: 'POST',
      },
    )

    emailProgressSuccess.value = response.message
  } catch (err) {
    emailProgressError.value = err instanceof Error ? err.message : String(err)
  } finally {
    emailingProgress.value = false
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0)
}

function goBack() {
  router.back()
}

function openCustomer() {
  const cid = ticket.value?.customerId
  if (cid) router.push({ name: 'CustomerProfile', query: { id: cid } })
}

function openVessel() {
  const vid = ticket.value?.vesselId
  if (vid) router.push({ name: 'VesselProfile', query: { id: vid } })
}

function editWork() {
  if (isTicketClosed.value) return
  const tid = ticket.value?.id
  if (tid) {
    router.push({ name: 'NewTicket', query: { id: tid } })
  }
}

function closeOutTicket() {
  const tid = ticket.value?.id
  if (tid) {
    router.push({ name: 'NewTicket', query: { id: tid, closeOut: '1' } })
  }
}

async function reopenTicket() {
  if (!ticket.value?.id) return

  updatingTicketStatus.value = true
  ticketStatusError.value = null

  try {
    const saved = await apiFetch<Ticket>(`/updateTicket/${encodeURIComponent(ticket.value.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'open' }),
    })

    const normalized = {
      ...saved,
      id: String(saved.id ?? (saved as Ticket & { _id?: string })._id ?? ticket.value.id),
    }

    ticket.value = normalized
    ticketStore.addTicket(normalized)
  } catch (err) {
    ticketStatusError.value = err instanceof Error ? err.message : String(err)
  } finally {
    updatingTicketStatus.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.ticket-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.ticket-shell {
  width: min(100%, 880px);
  margin-block: auto;
}

.profile-card,
.status-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 24px;
}

.status-card {
  text-align: center;
  color: #334155;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--color-ocean-dark);
  cursor: pointer;
  margin-bottom: 16px;
  padding: 0;
  font-weight: 600;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.header-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
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

.ticket-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
}

.owner-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 14px;
  background: #eff6ff;
  color: #0f172a;
  margin-bottom: 20px;
}

.owner-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1d4ed8;
  font-weight: 700;
}

.owner-divider {
  color: #94a3b8;
}

.owner-link {
  font-weight: 600;
}

.details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.details li {
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f172a;
}

.details strong {
  display: block;
  margin-bottom: 4px;
  color: #475569;
}

.notes-block {
  margin-top: 24px;
}

.notes-text {
  margin: 0;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  white-space: pre-wrap;
}

.notes-stack {
  display: grid;
  gap: 10px;
}

.photo-grid {
  --ticket-photo-tile-width: 260px;
  --ticket-photo-tile-height: 195px;
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--ticket-photo-tile-width));
  gap: 12px;
  justify-content: flex-start;
  margin-top: 12px;
}

.photo-card {
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

.plan-block {
  margin-top: 24px;
  display: grid;
  gap: 12px;
}

.plan-items {
  display: grid;
  gap: 8px;
}

.plan-item {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #0f172a;
  font-weight: 500;
}

.plan-item .done {
  text-decoration: line-through;
  color: #64748b;
}

.part-cost {
  margin-left: auto;
  color: #334155;
  font-weight: 700;
}

.invoice-block .section-heading p {
  margin: 4px 0 0;
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
  color: #0f172a;
  font-size: 1.04rem;
}

.diagnostics-section {
  margin-top: 24px;
  display: grid;
  gap: 18px;
}

.diagnostics-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.diagnostics-toggle {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  padding: 10px 12px;
  background: #f8fbff;
}

.diagnostics-toggle legend {
  padding: 0 4px;
  font-weight: 700;
  color: #0f172a;
}

.diagnostics-toggle label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #334155;
}

.diagnostics-form {
  display: grid;
  gap: 18px;
}

.diagnostics-heading p {
  margin: 4px 0 0;
  color: #64748b;
}

.diagnostics-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
}

.diagnostics-save {
  white-space: nowrap;
}

.diagnostics-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  padding-top: 4px;
}

.diagnostic-group {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
}

.diagnostic-group-header h4 {
  margin: 0;
  color: #0f172a;
}

.secondary {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  min-height: 42px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.secondary:hover:not(:disabled) {
  background: #dbeafe;
}

.secondary:disabled {
  border-color: #d1d5db;
  background: #e5e7eb;
  color: #64748b;
  cursor: not-allowed;
}

.diagnostics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.diagnostics-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.section-heading h3 {
  margin: 0 0 12px;
  color: #0f172a;
}

.notes-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f172a;
  line-height: 1.6;
}

.empty-state {
  padding: 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #475569;
  background: #f8fafc;
  text-align: center;
}

.error {
  color: #b91c1c;
}

.success {
  color: #059669;
}

@media (max-width: 720px) {
  .photo-grid {
    grid-template-columns: 1fr;
  }

  .photo-card,
  .photo-preview {
    width: 100%;
  }

  .photo-preview {
    height: auto;
    aspect-ratio: 4 / 3;
  }

  .diagnostics-heading {
    flex-direction: column;
  }

  .diagnostics-toggle {
    width: 100%;
  }

  .diagnostics-actions {
    justify-content: flex-start;
  }

  .diagnostics-footer {
    justify-content: flex-start;
  }

  .diagnostics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
