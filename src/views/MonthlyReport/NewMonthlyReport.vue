<template>
  <main class="monthly-report-create-page">
    <div class="report-shell">
      <button class="back" @click="goBack">← Back</button>

      <section class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">
              {{ isEditMode ? 'Monthly report update' : 'Monthly report creation' }}
            </p>
            <h2>{{ isEditMode ? 'Update Monthly Report' : 'New Monthly Report' }}</h2>
          </div>
        </header>

        <form class="report-form" @submit.prevent="submit('draft')">
          <section class="identity-section">
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

              <label class="full-width">
                Report Date
                <input v-model="form.reportDate" type="date" required :disabled="isLockedReport" />
              </label>
            </div>
          </section>

          <MonthlyReportDiagnosticsSection
            :diagnostic-sections="monthlyReportDiagnosticSections"
            :diagnostics="form.diagnostics"
            :readonly="isLockedReport"
            description="Complete the vessel inspection details for this monthly report."
            @error="error = $event"
            @update-diagnostic="updateDiagnosticEntry"
          />

          <section class="summary-section">
            <div class="section-heading">
              <!-- <h3>Summary of Monthly Report</h3>
              <p>Record the overall summary after completing the diagnostic inspection.</p> -->
            </div>

            <label v-if="!isEditMode">
              Summary of Monthly Report
              <textarea v-model="form.notes" rows="5" />
            </label>

            <section v-else class="notes-history-block">
              <div v-if="existingNoteEntries.length" class="notes-stack">
                <div
                  v-for="(entry, index) in existingNoteEntries"
                  :key="index"
                  class="immutable-notes"
                >
                  {{ entry }}
                </div>
              </div>
              <div v-else class="empty-state">No previous summary yet.</div>

              <label>
                New Summary Update
                <textarea
                  v-model="newUpdateNote"
                  rows="4"
                  placeholder="Add an update to the monthly report summary"
                  :disabled="isLockedReport"
                />
              </label>
            </section>
          </section>

          <section v-if="!isLockedReport" class="lock-confirmation">
            <label class="lock-checkbox-row">
              <input v-model="lockAcknowledge" type="checkbox" />
              <span>Completed monthly reports can not be reopened.</span>
            </label>
            <p class="lock-help">
              Save Draft keeps this report editable. Complete & Lock makes it immutable until an
              admin or service manager unlocks it.
            </p>
          </section>

          <div v-else class="locked-banner">
            This monthly report is completed and locked. It cannot be edited here unless unlocked by
            an admin or service manager.
          </div>

          <div class="actions">
            <button type="submit" class="secondary" :disabled="submitting || isLockedReport">
              {{ isEditMode ? 'Save Draft' : 'Create Draft' }}
            </button>
            <button
              type="button"
              class="primary"
              :disabled="submitting || isLockedReport"
              @click="submit('complete')"
            >
              {{ isEditMode ? 'Complete & Lock' : 'Create Completed & Lock' }}
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
import MonthlyReportDiagnosticsSection from '@/components/MonthlyReport/MonthlyReportDiagnosticsSection.vue'
import { apiFetch } from '@/services/http/client'
import { useMonthlyReportStore } from '@/stores/monthlyReports'
import { useUiStore } from '@/stores/ui'
import type { MonthlyReport, MonthlyReportDiagnosticEntry } from '@/types/mock'
import { formatLocalDateTime } from '@/shared/datetime/format'
import { splitNoteHistory } from '@/domain/notes/history'
import {
  createMonthlyReportDiagnostics,
  monthlyReportDiagnosticSections,
} from '@/domain/monthlyReports/diagnostics'
import { estimateDataUrlBytes } from '@/domain/tickets/photos'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const reportStore = useMonthlyReportStore()

const submitting = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const editReportId = computed(() => String(route.query.id || ''))
const isEditMode = computed(() => Boolean(editReportId.value))
const existingNotes = ref('')
const newUpdateNote = ref('')
const existingNoteEntries = computed(() => splitNoteHistory(existingNotes.value))
const lockAcknowledge = ref(false)
const isLockedReport = ref(false)

type SubmitMode = 'draft' | 'complete'

const form = reactive({
  customerName: '',
  vesselName: '',
  customerId: '',
  vesselId: '',
  reportDate: '',
  notes: '',
  diagnostics: createMonthlyReportDiagnostics(),
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

function hydrateFromReport(report: MonthlyReport) {
  form.customerName = report.customerName ?? ''
  form.vesselName = report.vesselName ?? ''
  form.customerId = String(report.customerId ?? '')
  form.vesselId = String(report.vesselId ?? '')
  form.reportDate = report.reportDate ?? ''
  isLockedReport.value = Boolean(report.isLocked)
  existingNotes.value = report.notes ?? ''
  newUpdateNote.value = ''
  form.notes = ''
  Object.assign(form.diagnostics, createMonthlyReportDiagnostics(report.diagnostics))
}

async function loadForEdit() {
  if (!isEditMode.value) return
  const id = editReportId.value
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
  hydrateFromReport(normalized)
}

function appendUpdateNote(previous: string, note: string): string {
  const trimmed = note.trim()
  if (!trimmed) return previous
  const entry = `[${formatLocalDateTime(new Date())}] ${trimmed}`
  return previous ? `${previous}\n\n${entry}` : entry
}

function buildInitialNote(note: string): string {
  const trimmed = note.trim()
  if (!trimmed) return ''
  return `[${formatLocalDateTime(new Date())}] ${trimmed}`
}

function estimateDiagnosticPhotoBytes(): number {
  return Object.values(form.diagnostics).reduce(
    (total, entry) =>
      total +
      entry.photos.reduce(
        (photoTotal, photo) => photoTotal + estimateDataUrlBytes(photo.dataUrl),
        0,
      ),
    0,
  )
}

function updateDiagnosticEntry(payload: { key: string; entry: MonthlyReportDiagnosticEntry }) {
  form.diagnostics[payload.key] = payload.entry
}

async function submit(mode: SubmitMode = 'draft') {
  submitting.value = true
  success.value = false
  error.value = null

  try {
    if (isLockedReport.value) {
      throw new Error(
        'This monthly report is completed and locked. Ask an admin or service manager to unlock it before editing.',
      )
    }

    if (mode === 'complete' && !lockAcknowledge.value) {
      throw new Error('Please acknowledge that completed monthly reports can not be reopened.')
    }

    if (estimateDiagnosticPhotoBytes() > 12 * 1024 * 1024) {
      throw new Error('Photos are too large. Please remove some photos or use smaller images.')
    }

    const payload = {
      customerName: form.customerName,
      vesselName: form.vesselName,
      customerId: form.customerId,
      vesselId: form.vesselId,
      reportDate: form.reportDate,
      diagnostics: { ...form.diagnostics },
      notes: isEditMode.value
        ? appendUpdateNote(existingNotes.value, newUpdateNote.value)
        : buildInitialNote(form.notes),
      ...(mode === 'complete' ? { markCompleted: true } : {}),
    }

    const saved = isEditMode.value
      ? await apiFetch<MonthlyReport>(
          `/updateMonthlyReport/${encodeURIComponent(editReportId.value)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        )
      : await apiFetch<MonthlyReport>('/newMonthlyReport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, createdAt: new Date().toISOString() }),
        })

    const savedId = String(
      (saved as MonthlyReport & { _id?: string }).id ??
        (saved as MonthlyReport & { _id?: string })._id ??
        (isEditMode.value ? editReportId.value : ''),
    ).trim()

    if (!savedId) throw new Error('Report saved, but no id was returned')

    reportStore.addReport({ ...saved, id: savedId })
    success.value = true
    router.push({ name: 'MonthlyReport', query: { id: savedId } })
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
.monthly-report-create-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.report-shell {
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

.report-form {
  display: grid;
  gap: 20px;
}

.identity-section {
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

.summary-section,
.notes-history-block {
  display: grid;
  gap: 12px;
}

.summary-section {
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
}

.lock-confirmation {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid #fde68a;
  border-radius: 12px;
  background: #fffbeb;
}

.lock-checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #92400e;
  font-weight: 700;
}

.lock-checkbox-row input {
  width: 16px;
  height: 16px;
}

.lock-help {
  margin: 0;
  color: #78350f;
  font-size: 0.92rem;
}

.locked-banner {
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
  color: #991b1b;
  padding: 12px 14px;
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

.immutable {
  background: #f1f5f9;
  color: #64748b;
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

.secondary {
  border: 1px solid #94a3b8;
  background: #f8fafc;
  color: #0f172a;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
}

.secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
