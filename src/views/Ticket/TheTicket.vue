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
            <button type="button" class="secondary" @click="editWork">Update Work</button>
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
          <!-- <li><strong>ID</strong> {{ ticket.id }}</li> -->
          <li><strong>Status</strong> {{ ticket.status }}</li>
          <li><strong>Priority</strong> {{ ticket.priority }}</li>
          <li><strong>Created</strong> {{ formatLocalDateTime(ticket.createdAt) }}</li>
          <li><strong>Scheduled</strong> {{ formatLocalDateTime(ticket.scheduledDate) }}</li>
        </ul>

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
            </label>
          </div>
          <div v-else class="empty-state">
            No required parts have been added to this ticket yet.
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
import type { DiagnosticLevel, PlanActionItem, RequiredPartItem, Ticket } from '@/types/mock'
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

const noteEntries = computed(() => splitNoteHistory(ticket.value?.notes))

async function load() {
  loading.value = true
  error.value = null
  try {
    const id = String(route.query.id || '')
    if (!id) throw new Error('No ticket id provided')

    await uiStore.fetchAllData(true)
    ticket.value = ticketStore.ticketById(id)

    if (!ticket.value) {
      const refreshedTickets = await apiFetch<Ticket[]>('/getAllTickets')
      const normalizedTickets = refreshedTickets.map((record) => ({
        ...record,
        id: String(record.id ?? (record as Ticket & { _id?: string })._id ?? ''),
      }))

      const matchedTicket = normalizedTickets.find((record) => record.id === id) ?? null
      if (matchedTicket) {
        ticketStore.addTicket(matchedTicket)
        ticket.value = matchedTicket
      }
    }

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

  showDiagnostics.value = Object.values(currentDiagnostics).some(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== '' && value !== 'N/A',
  )
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
  const tid = ticket.value?.id
  if (tid) {
    router.push({ name: 'NewTicket', query: { id: tid } })
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
  color: #2563eb;
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

.notes-stack {
  display: grid;
  gap: 10px;
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
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
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
