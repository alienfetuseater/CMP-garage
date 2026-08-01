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
            <h2>{{ vesselName ?? report.vesselName ?? 'Monthly Report' }}</h2>
            <div class="status-row">
              <span
                class="profile-status-badge"
                :class="report.isLocked ? 'is-locked' : 'is-draft'"
              >
                {{ report.isLocked ? 'Completed • Locked' : 'Draft • Editable' }}
              </span>
            </div>
          </div>

          <div class="header-actions profile-action-group">
            <button
              type="button"
              class="primary profile-action-btn"
              :disabled="report.isLocked"
              @click="editReport"
            >
              Update
            </button>
            <button
              v-if="canUnlockReport"
              type="button"
              class="secondary profile-action-btn"
              :disabled="unlocking"
              @click="unlockReport"
            >
              {{ unlocking ? 'Unlocking...' : 'Unlock Report' }}
            </button>
            <button
              type="button"
              class="primary profile-action-btn"
              :disabled="generatingPreview"
              @click="generatePreview"
            >
              Preview Report
            </button>
          </div>
        </header>

        <div v-if="report.isLocked" class="lock-notice">
          This monthly report is immutable while completed and locked.
          <span v-if="!canUnlockReport">Only admin or service manager users can unlock it.</span>
        </div>
        <div v-if="unlockSuccess" class="success">{{ unlockSuccess }}</div>
        <div v-if="unlockError" class="error">{{ unlockError }}</div>

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
            <span class="summary-label">Report Date</span>
            <span>{{ formatReportDate(report.reportDate) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Created</span>
            <span>{{ formatLocalDateTime(report.createdAt) }}</span>
          </div>
        </div>

        <MonthlyReportDiagnosticsSection
          :diagnostic-sections="monthlyReportDiagnosticSections"
          :diagnostics="diagnostics"
          :readonly="true"
          description="Inspection findings recorded for this monthly report."
        />

        <section class="notes-block">
          <div class="section-heading profile-section-heading">
            <h3>Summary of Monthly Report</h3>
          </div>

          <div v-if="noteEntries.length" class="notes-stack">
            <div v-for="(entry, index) in noteEntries" :key="index" class="notes-card">
              {{ entry }}
            </div>
          </div>
          <div v-else class="empty-state">No summary provided for this report.</div>
        </section>

        <DocumentPreviewModal
          v-model="showPreview"
          eyebrow="Monthly report preview"
          :heading="`${vesselName ?? report.vesselName ?? 'Vessel'} Monthly Report`"
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
import { computed, ref, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useMonthlyReportStore } from '@/stores/monthlyReports'
import { useAuthStore } from '@/stores/auth'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import { API_BASE, apiFetch } from '@/services/http/client'
import MonthlyReportDiagnosticsSection from '@/components/MonthlyReport/MonthlyReportDiagnosticsSection.vue'
import DocumentPreviewModal from '@/components/Shared/DocumentPreviewModal.vue'
import type { MonthlyReport, MonthlyReportDiagnostics } from '@/types/mock'
import { formatLocalDateTime } from '@/shared/datetime/format'
import { splitNoteHistory } from '@/domain/notes/history'
import {
  createMonthlyReportDiagnostics,
  monthlyReportDiagnosticSections,
} from '@/domain/monthlyReports/diagnostics'
import { normalizeUserRole } from '@/domain/auth/permissions'

const uiStore = useUiStore()
const reportStore = useMonthlyReportStore()
const authStore = useAuthStore()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
const route = useRoute()
const router = useRouter()

const report = ref<MonthlyReport | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const customerName = ref<string | null>(null)
const vesselName = ref<string | null>(null)
const generatingPreview = ref(false)
const showPreview = ref(false)
const previewUrl = ref<string | null>(null)
const previewActionBusy = ref(false)
const previewActionSuccess = ref<string | null>(null)
const previewActionError = ref<string | null>(null)
const unlocking = ref(false)
const unlockSuccess = ref<string | null>(null)
const unlockError = ref<string | null>(null)

const diagnostics = ref<MonthlyReportDiagnostics>(createMonthlyReportDiagnostics())
const noteEntries = computed(() => splitNoteHistory(report.value?.notes))
const canUnlockReport = computed(() => {
  const role = normalizeUserRole(authStore.user?.role ?? '')
  return Boolean(report.value?.isLocked) && (role === 'admin' || role === 'serviceManager')
})

function formatReportDate(value?: string) {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return value
  return new Date(year, month - 1, day).toLocaleDateString()
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
  diagnostics.value = createMonthlyReportDiagnostics(report.value?.diagnostics)
}

function editReport() {
  const id = report.value?.id
  if (report.value?.isLocked) return
  if (id) router.push({ name: 'NewMonthlyReport', query: { id } })
}

async function unlockReport() {
  if (!report.value?.id || !canUnlockReport.value) return

  unlocking.value = true
  unlockSuccess.value = null
  unlockError.value = null

  try {
    const unlocked = await apiFetch<MonthlyReport>(
      `/unlockMonthlyReport/${encodeURIComponent(report.value.id)}`,
      {
        method: 'PUT',
      },
    )

    const normalized = {
      ...unlocked,
      id: String(
        (unlocked as MonthlyReport & { _id?: string }).id ??
          (unlocked as MonthlyReport & { _id?: string })._id ??
          report.value.id,
      ),
    }

    reportStore.addReport(normalized)
    report.value = normalized
    hydrateDiagnostics()
    unlockSuccess.value = 'Report unlocked. It can now be edited as a draft.'
  } catch (err) {
    unlockError.value = err instanceof Error ? err.message : String(err)
  } finally {
    unlocking.value = false
  }
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
    (report.value?.vesselName || report.value?.reportDate || report.value?.id || 'report')
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

.status-row {
  margin-top: 8px;
}

.profile-status-badge.is-locked {
  background: #fee2e2;
  color: #991b1b;
}

.profile-status-badge.is-draft {
  background: #ecfeff;
  color: #0f766e;
}

.secondary {
  border: 1px solid #94a3b8;
  background: #f8fafc;
  color: #0f172a;
  border-radius: 999px;
  min-height: 42px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.lock-notice {
  margin-bottom: 14px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
  color: #991b1b;
  padding: 10px 12px;
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
