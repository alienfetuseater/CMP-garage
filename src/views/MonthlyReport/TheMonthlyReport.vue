<template>
  <main class="monthly-report-page">
    <div class="report-shell">
      <button class="back" @click="goBack">← Back</button>

      <div v-if="loading" class="status-card">Loading...</div>
      <div v-else-if="error" class="status-card error">{{ error }}</div>

      <section v-else-if="report" class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">Monthly report</p>
            <h2>{{ report.service_title }}</h2>
          </div>

          <div class="header-actions profile-action-group">
            <div class="ticket-badge profile-status-badge">{{ report.status }}</div>
            <button type="button" class="primary profile-action-btn" @click="editReport">
              Update
            </button>
            <button
              type="button"
              class="primary profile-action-btn"
              :disabled="generatingPreview"
              @click="generatePreview"
            >
              Preview Report
            </button>
            <span v-if="updatingStatus">Updating...</span>
            <span v-if="statusError" class="error">{{ statusError }}</span>
          </div>
        </header>

        <div class="summary-strip">
          <div class="summary-item">
            <span class="summary-label">Customer</span>
            <button type="button" class="link-btn" @click="openCustomer">
              {{ customerName ?? report.customerId }}
            </button>
          </div>
          <div class="summary-item">
            <span class="summary-label">Vessel</span>
            <button type="button" class="link-btn" @click="openVessel">
              {{ vesselName ?? report.vesselId }}
            </button>
          </div>
          <div class="summary-item">
            <span class="summary-label">Report Month</span>
            <span>{{ formatReportMonth(report.reportMonth) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Priority</span>
            <span>{{ report.priority }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Created</span>
            <span>{{ formatLocalDateTime(report.createdAt) }}</span>
          </div>
        </div>

        <TicketNotesSection
          title="Initial Assessment"
          :text="initialAssessmentText"
          :photos="initialAssessmentPhotos"
          empty-text="No initial assessment provided for this report."
        />

        <TicketNotesSection
          title="Recommended Service"
          :text="recommendedServiceText"
          empty-text="No recommended service provided for this report."
        />

        <TicketPlanSection
          title="Plan of Action"
          item-label="items"
          :completed-count="completedPlanCount"
          :total-count="totalPlanCount"
          :progress="planProgress"
          :items="planItems"
          empty-text="No plan items have been added to this report yet."
        />

        <TicketPlanSection
          title="Required Parts"
          item-label="parts"
          :completed-count="completedRequiredParts"
          :total-count="totalRequiredParts"
          :progress="requiredPartsProgress"
          :items="requiredParts"
          :show-cost="true"
          empty-text="No required parts have been added to this report yet."
        />

        <section class="notes-block">
          <div class="section-heading profile-section-heading">
            <h3>Notes</h3>
          </div>

          <div v-if="noteEntries.length" class="notes-stack">
            <div v-for="(entry, index) in noteEntries" :key="index" class="notes-card">
              {{ entry }}
            </div>
          </div>
          <div v-else class="empty-state">No notes provided for this report.</div>
        </section>

        <TicketNotesSection
          title="Summary of Work Completed"
          :text="summaryOfWorkCompletedText"
          :photos="summaryOfWorkCompletedPhotos"
          empty-text="No summary of work completed provided for this report."
        />

        <TicketInvoiceSection
          :selected-parts-total="selectedPartsTotal"
          :normalized-labor-cost="normalizedLaborCost"
          :invoice-total="invoiceTotal"
        />

        <TicketDiagnosticsSection
          :diagnostic-sections="diagnosticSections"
          :diagnostics="diagnostics"
          :show-diagnostics="showDiagnostics"
          :saving-diagnostics="savingDiagnostics"
          :diagnostics-success="diagnosticsSuccess"
          :diagnostics-error="diagnosticsError"
          @update:show-diagnostics="showDiagnostics = $event"
          @update-diagnostic="updateDiagnosticField"
          @save="saveDiagnostics"
        />

        <DocumentPreviewModal
          v-model="showPreview"
          eyebrow="Monthly report preview"
          :heading="report.service_title"
          :preview-url="previewUrl"
          :loading="previewActionBusy"
          :busy="previewActionBusy"
          :success="previewActionSuccess"
          :error="previewActionError"
          iframe-title="Monthly Report Preview"
          title-id="monthly-report-preview-title"
          :show-save-button="true"
          :show-email-button="true"
          @save="savePreview"
          @email="emailPreview"
          @update:model-value="handlePreviewVisibilityChange"
        />
      </section>

      <div v-else class="status-card">No report found.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useMonthlyReportStore } from '@/stores/monthlyReports'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import { API_BASE, apiFetch } from '@/services/http/client'
import TicketNotesSection from '@/components/Ticket/TicketNotesSection.vue'
import TicketPlanSection from '@/components/Ticket/TicketPlanSection.vue'
import TicketInvoiceSection from '@/components/Ticket/TicketInvoiceSection.vue'
import TicketDiagnosticsSection from '@/components/Ticket/TicketDiagnosticsSection.vue'
import DocumentPreviewModal from '@/components/Shared/DocumentPreviewModal.vue'
import type {
  DiagnosticLevel,
  MonthlyReport,
  PlanActionItem,
  RequiredPartItem,
  TicketPhotoAttachment,
} from '@/types/mock'
import { formatLocalDateTime } from '@/shared/datetime/format'
import { splitNoteHistory } from '@/domain/notes/history'

const uiStore = useUiStore()
const reportStore = useMonthlyReportStore()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
const route = useRoute()
const router = useRouter()

const report = ref<MonthlyReport | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const customerName = ref<string | null>(null)
const vesselName = ref<string | null>(null)
const updatingStatus = ref(false)
const statusError = ref<string | null>(null)
const savingDiagnostics = ref(false)
const diagnosticsSuccess = ref(false)
const diagnosticsError = ref<string | null>(null)
const showDiagnostics = ref(false)
const generatingPreview = ref(false)
const showPreview = ref(false)
const previewUrl = ref<string | null>(null)
const previewActionBusy = ref(false)
const previewActionSuccess = ref<string | null>(null)
const previewActionError = ref<string | null>(null)

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

const planItems = computed<PlanActionItem[]>(() => report.value?.planOfAction ?? [])
const totalPlanCount = computed(() => planItems.value.length)
const completedPlanCount = computed(() => planItems.value.filter((item) => item.completed).length)
const planProgress = computed(() => {
  if (!totalPlanCount.value) return 0
  return Math.round((completedPlanCount.value / totalPlanCount.value) * 100)
})

const requiredParts = computed<RequiredPartItem[]>(() => report.value?.requiredParts ?? [])
const totalRequiredParts = computed(() => requiredParts.value.length)
const completedRequiredParts = computed(
  () => requiredParts.value.filter((item) => item.completed).length,
)
const requiredPartsProgress = computed(() => {
  if (!totalRequiredParts.value) return 0
  return Math.round((completedRequiredParts.value / totalRequiredParts.value) * 100)
})

const initialAssessmentText = computed(() => report.value?.initialAssessment?.trim() ?? '')
const recommendedServiceText = computed(() => report.value?.recommendedService?.trim() ?? '')
const summaryOfWorkCompletedText = computed(
  () => report.value?.summaryOfWorkPerformed?.trim() ?? '',
)
const initialAssessmentPhotos = computed<TicketPhotoAttachment[]>(
  () => report.value?.initialAssessmentPhotos ?? [],
)
const summaryOfWorkCompletedPhotos = computed<TicketPhotoAttachment[]>(
  () => report.value?.summaryOfWorkPerformedPhotos ?? [],
)
const noteEntries = computed(() => splitNoteHistory(report.value?.notes))
const normalizedLaborCost = computed(() => {
  const value = Number(report.value?.laborCost ?? 0)
  if (!Number.isFinite(value) || value < 0) return 0
  return value
})
const selectedPartsTotal = computed(() =>
  requiredParts.value.reduce((total, item) => {
    if (!item.completed) return total
    const cost = Number(item.cost ?? 0)
    if (!Number.isFinite(cost) || cost <= 0) return total
    return total + cost
  }, 0),
)
const invoiceTotal = computed(() => selectedPartsTotal.value + normalizedLaborCost.value)

function formatReportMonth(value?: string) {
  if (!value) return '—'
  const [year, month] = value.split('-')
  if (!year || !month) return value
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const id = String(route.query.id || '')
    if (!id) throw new Error('No report id provided')

    await uiStore.fetchAllData()

    const full = await apiFetch<MonthlyReport>(
      `/getMonthlyReportProfile?id=${encodeURIComponent(id)}`,
    )
    const normalized = {
      ...full,
      id: String(
        (full as MonthlyReport & { _id?: string }).id ??
          (full as MonthlyReport & { _id?: string })._id ??
          id,
      ),
    }
    reportStore.addReport(normalized)
    report.value = normalized

    hydrateDiagnostics()

    const cid = report.value.customerId
    const c = customerStore.customers.find((x) => x.id === cid)
    customerName.value = c ? c.name : cid

    const vid = report.value.vesselId
    const v = vesselStore.vessels.find((x) => x.id === vid)
    vesselName.value = v ? v.vesselName : vid
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

function hydrateDiagnostics() {
  const current = report.value?.diagnostics ?? {}
  diagnosticFields.forEach((field) => {
    diagnostics[field] = current[field] ?? 'N/A'
  })
  showDiagnostics.value = false
}

function updateDiagnosticField(payload: { key: string; value: DiagnosticLevel }) {
  const field = payload.key as (typeof diagnosticFields)[number]
  if (!diagnosticFields.includes(field)) return
  diagnostics[field] = payload.value
}

async function saveDiagnostics() {
  if (!report.value) return
  savingDiagnostics.value = true
  diagnosticsSuccess.value = false
  diagnosticsError.value = null
  try {
    const payload = {
      diagnostics: Object.fromEntries(diagnosticFields.map((field) => [field, diagnostics[field]])),
    }
    const saved = await apiFetch<MonthlyReport>(`/updateMonthlyReport/${report.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    report.value = saved
    reportStore.addReport(saved)
    diagnosticsSuccess.value = true
  } catch (err) {
    diagnosticsError.value = err instanceof Error ? err.message : String(err)
  } finally {
    savingDiagnostics.value = false
  }
}

function editReport() {
  const id = report.value?.id
  if (id) router.push({ name: 'NewMonthlyReport', query: { id } })
}

function openCustomer() {
  const cid = report.value?.customerId
  if (cid) router.push({ name: 'CustomerProfile', query: { id: cid } })
}

function openVessel() {
  const vid = report.value?.vesselId
  if (vid) router.push({ name: 'VesselProfile', query: { id: vid } })
}

function goBack() {
  router.back()
}

function generatePreview() {
  if (!report.value) return
  generatingPreview.value = true
  previewActionSuccess.value = null
  previewActionError.value = null
  void openReportPreview(report.value.id).finally(() => {
    generatingPreview.value = false
  })
}

async function openReportPreview(reportId: string) {
  previewActionBusy.value = true
  previewActionSuccess.value = null
  previewActionError.value = null
  showPreview.value = true

  try {
    const token = localStorage.getItem('cmp_auth_token')
    const response = await fetch(
      `${API_BASE}/previewMonthlyReport/${encodeURIComponent(reportId)}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`${response.status} ${response.statusText}: ${errorText}`)
    }

    const blob = await response.blob()
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    previewActionError.value = err instanceof Error ? err.message : String(err)
  } finally {
    previewActionBusy.value = false
  }
}

function handlePreviewVisibilityChange(isOpen: boolean) {
  if (!isOpen) {
    closePreview()
    return
  }
  showPreview.value = true
}

function closePreview() {
  showPreview.value = false
  previewActionSuccess.value = null
  previewActionError.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

function savePreview() {
  if (!previewUrl.value) return
  previewActionSuccess.value = 'Download started'
  previewActionError.value = null
  const safeName =
    (report.value?.service_title || report.value?.id || 'report')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'report'
  const link = document.createElement('a')
  link.href = previewUrl.value
  link.download = `monthly-report-${safeName}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

async function emailPreview() {
  if (!report.value) return
  previewActionBusy.value = true
  previewActionSuccess.value = null
  previewActionError.value = null
  try {
    const response = await apiFetch<{ message: string; recipient: string }>(
      `/emailMonthlyReport/${encodeURIComponent(report.value.id)}`,
      { method: 'POST' },
    )
    previewActionSuccess.value = response.message
  } catch (err) {
    previewActionError.value = err instanceof Error ? err.message : String(err)
  } finally {
    previewActionBusy.value = false
  }
}

onMounted(load)

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<style scoped>
.monthly-report-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.report-shell {
  width: min(100%, 880px);
  position: relative;
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

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.profile-action-group {
  align-items: center;
}

.profile-action-btn {
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

.profile-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profile-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.summary-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 24px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #eff6ff;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 100px;
}

.summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1d4ed8;
  font-weight: 700;
}

.link-btn {
  border: none;
  background: transparent;
  padding: 0;
  color: var(--color-ocean-dark);
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.link-btn:hover {
  text-decoration: underline;
}

.notes-block {
  margin-top: 24px;
}

.section-heading h3 {
  margin: 0 0 12px;
  color: #0f172a;
}

.notes-stack {
  display: grid;
  gap: 10px;
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
  .profile-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }
}
</style>
