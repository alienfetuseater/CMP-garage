<template>
  <main class="vessel-profile">
    <div class="vessel-profile-shell">
      <button class="back" @click="goBack">← Back</button>

      <div v-if="loading" class="status-card">Loading...</div>
      <div v-else-if="error" class="status-card error">{{ error }}</div>

      <section v-else-if="vessel" class="profile-card">
        <VesselProfileHeader
          :vessel-name="vessel.vesselName"
          :generating-dossier="generatingVesselDossier"
          @edit="editVessel"
          @new-ticket="createTicket"
          @generate-dossier="generateVesselDossier"
        />

        <VesselOwnerSummary
          :owner-name="vessel.customerName"
          :owner-phone="ownerPhone"
          :owner-address="ownerAddress"
          @open-owner="openOwner"
        />

        <VesselKeyFacts :vessel="vessel" :photo-preview-url="vessel.boatPhotoDataUrl || null" />

        <section class="related">
          <div class="section-heading profile-section-heading">
            <h3>Service History</h3>
          </div>

          <div class="history-block">
            <div class="history-header">
              <h4>Diagnostic History</h4>
              <span class="count profile-count-badge">{{ diagnosticHistory.length }}</span>
            </div>

            <div v-if="diagnosticHistory.length">
              <ul class="history-list">
                <li v-for="entry in diagnosticHistory" :key="entry.key" class="history-item">
                  <strong>{{ entry.title }}</strong>
                  <span>{{ entry.date }}</span>
                  <span>{{ entry.summary }}</span>
                  <span>{{ entry.details }}</span>
                </li>
              </ul>
            </div>
            <div v-else class="empty-state">No diagnostics on record for this vessel.</div>
          </div>

          <VesselHistoryGroup
            title="Repair History"
            :items="repairHistory"
            :loading="loadingTickets"
            empty-message="No repairs for this vessel."
            @open-item="openTicket"
          />

          <VesselHistoryGroup
            title="Maintenance History"
            :items="maintenanceHistory"
            :loading="loadingTickets"
            empty-message="No maintenance jobs for this vessel."
            @open-item="openTicket"
          />

          <VesselHistoryGroup
            title="Upgrades History"
            :items="upgradeHistory"
            :loading="loadingTickets"
            empty-message="No upgrades for this vessel."
            @open-item="openTicket"
          />
        </section>

        <DocumentPreviewModal
          v-model="showVesselDossierPreview"
          eyebrow="Vessel dossier preview"
          :heading="vessel.vesselName"
          :preview-url="dossierPreviewUrl"
          :loading="previewActionBusy"
          :busy="previewActionBusy"
          :success="previewActionSuccess"
          :error="previewActionError"
          iframe-title="Vessel dossier preview"
          title-id="vessel-dossier-preview-title"
          :show-save-button="true"
          :show-email-button="true"
          @save="savePreview"
          @email="emailPreview"
          @update:model-value="handlePreviewVisibilityChange"
        />
      </section>

      <div v-else class="status-card">No vessel found.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import { useTicketStore } from '@/stores/tickets'
import { API_BASE, apiFetch } from '@/services/http/client'
import type { Vessel, Ticket } from '@/types/mock'
import { formatLocalDateTime } from '@/shared/datetime/format'
import VesselProfileHeader from '@/components/Vessel/VesselProfileHeader.vue'
import VesselOwnerSummary from '@/components/Vessel/VesselOwnerSummary.vue'
import VesselKeyFacts from '@/components/Vessel/VesselKeyFacts.vue'
import VesselHistoryGroup from '@/components/Vessel/VesselHistoryGroup.vue'
import DocumentPreviewModal from '@/components/Shared/DocumentPreviewModal.vue'

const uiStore = useUiStore()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
const ticketStore = useTicketStore()
const route = useRoute()
const router = useRouter()

const vessel = ref<Vessel | null>(null)
const ticketsForVessel = ref<Ticket[]>([])
const generatingVesselDossier = ref(false)
const showVesselDossierPreview = ref(false)
const dossierPreviewUrl = ref<string | null>(null)
const previewActionBusy = ref(false)
const previewActionSuccess = ref<string | null>(null)
const previewActionError = ref<string | null>(null)

const loading = computed(() => uiStore.loading)
const error = computed(() => uiStore.error)
const loadingTickets = computed(() => false)

const ownerId = computed(() => {
  if (!vessel.value) return null
  return vessel.value.customerId ?? (vessel.value as unknown as { owner?: string })?.owner ?? null
})

const ownerCustomer = computed(() => {
  const id = ownerId.value
  if (!id) return null

  return customerStore.customerById(id)
})

const ownerPhoneRaw = computed(
  () => ownerCustomer.value?.phone ?? vessel.value?.customerPhone ?? '',
)
const ownerPhone = computed(() => formatPhone(ownerPhoneRaw.value))

const ownerAddress = computed(() => ownerCustomer.value?.address ?? 'No address available')

const diagnosticHistory = computed(() =>
  ticketsForVessel.value
    .filter((ticket) => ticket.service_category === 'inspection' && ticket.diagnostics)
    .map((ticket) => {
      const diagnostics = ticket.diagnostics ?? {}
      const entries = Object.entries(diagnostics).filter(
        ([, value]) => value !== undefined && value !== null && String(value).trim() !== '',
      )

      return {
        key: ticket.id,
        title: ticket.service_title,
        date: formatLocalDateTime(ticket.scheduledDate),
        summary: ticket.status,
        details:
          entries.length > 0
            ? entries
                .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${String(value).toUpperCase()}`)
                .join(' · ')
            : 'No diagnostic readings captured',
      }
    }),
)

const repairHistory = computed(() =>
  ticketsForVessel.value.filter((ticket) => ticket.service_category === 'repair'),
)

const maintenanceHistory = computed(() =>
  ticketsForVessel.value.filter((ticket) => ticket.service_category === 'maintenance'),
)

const upgradeHistory = computed(() =>
  ticketsForVessel.value.filter((ticket) => ticket.service_category === 'upgrade'),
)

function formatPhone(value?: string) {
  if (!value) return ''

  const digits = value.replace(/\D/g, '')
  if (digits.length < 10) return value

  const base = digits.slice(-10)
  const area = base.slice(0, 3)
  const prefix = base.slice(3, 6)
  const line = base.slice(6, 10)
  return `(${area}) ${prefix} - ${line}`
}

async function load() {
  try {
    const id = String(route.query.id || '')
    if (!id) throw new Error('No vessel id provided')

    await uiStore.fetchAllData()
    vessel.value = vesselStore.vesselById(id)

    if (!vessel.value) {
      const fetchedVessel = await apiFetch<Vessel>(`/getBoatProfile?id=${encodeURIComponent(id)}`)
      const normalizedVessel = {
        ...fetchedVessel,
        id: String(fetchedVessel.id ?? (fetchedVessel as Vessel & { _id?: string })._id ?? id),
      }

      vesselStore.addVessel(normalizedVessel)
      vessel.value = normalizedVessel
    }

    ticketsForVessel.value = ticketStore.tickets.filter((ticket) => ticket.vesselId === id)
  } catch (err) {
    uiStore.error = err instanceof Error ? err.message : String(err)
  }
}

function goBack() {
  router.push({ name: 'CustomerDirectory' })
}

function openOwner() {
  if (!vessel.value) return

  const matchedById = ownerId.value ? customerStore.customerById(ownerId.value) : null

  if (matchedById) {
    router.push({ name: 'CustomerProfile', query: { id: matchedById.id } })
    return
  }

  const matchedCustomer =
    customerStore.customers.find(
      (customer) =>
        customer.name === vessel.value?.customerName ||
        customer.phone === vessel.value?.customerPhone,
    ) ?? null

  if (matchedCustomer) {
    router.push({ name: 'CustomerProfile', query: { id: matchedCustomer.id } })
  }
}

function openTicket(id: string) {
  if (id) router.push({ name: 'Ticket', query: { id } })
}

function editVessel() {
  if (!vessel.value) return
  router.push({ name: 'RegisterVessel', query: { id: vessel.value.id } })
}

function createTicket() {
  if (!vessel.value) return

  router.push({
    name: 'NewTicket',
    query: {
      customerName: vessel.value.customerName,
      vesselName: vessel.value.vesselName,
      vesselId: vessel.value.id,
      customerId: ownerId.value ?? '',
    },
  })
}

function generateVesselDossier() {
  if (!vessel.value) return

  generatingVesselDossier.value = true
  previewActionSuccess.value = null
  previewActionError.value = null

  void openVesselDossierPreview(vessel.value.id).finally(() => {
    generatingVesselDossier.value = false
  })
}

async function openVesselDossierPreview(vesselId: string) {
  previewActionBusy.value = true
  previewActionSuccess.value = null
  previewActionError.value = null
  showVesselDossierPreview.value = true

  try {
    const token = localStorage.getItem('cmp_auth_token')
    const response = await fetch(
      `${API_BASE}/previewVesselDossier/${encodeURIComponent(vesselId)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`${response.status} ${response.statusText}: ${errorText}`)
    }

    const blob = await response.blob()
    if (dossierPreviewUrl.value) {
      URL.revokeObjectURL(dossierPreviewUrl.value)
    }

    dossierPreviewUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    previewActionError.value = err instanceof Error ? err.message : String(err)
  } finally {
    previewActionBusy.value = false
  }
}

function handlePreviewVisibilityChange(isOpen: boolean) {
  if (!isOpen) {
    closeVesselDossierPreview()
    return
  }

  showVesselDossierPreview.value = true
}

function closeVesselDossierPreview() {
  showVesselDossierPreview.value = false
  previewActionSuccess.value = null
  previewActionError.value = null

  if (dossierPreviewUrl.value) {
    URL.revokeObjectURL(dossierPreviewUrl.value)
    dossierPreviewUrl.value = null
  }
}

function savePreview() {
  if (!dossierPreviewUrl.value) return

  previewActionSuccess.value = 'Download started'
  previewActionError.value = null

  const safeName =
    (vessel.value?.vesselName || 'vessel')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'vessel'

  const link = document.createElement('a')
  link.href = dossierPreviewUrl.value
  link.download = `vessel-dossier-${safeName}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

async function emailPreview() {
  if (!vessel.value) return

  previewActionBusy.value = true
  previewActionSuccess.value = null
  previewActionError.value = null

  try {
    const response = await apiFetch<{ message: string; recipients: string[] }>(
      `/emailVesselDossier/${encodeURIComponent(vessel.value.id)}`,
      {
        method: 'POST',
      },
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
  if (dossierPreviewUrl.value) {
    URL.revokeObjectURL(dossierPreviewUrl.value)
  }
})
</script>

<style scoped>
.vessel-profile {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.vessel-profile-shell {
  width: min(100%, 920px);
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
  position: absolute;
  top: 6px;
  right: calc(100% + 16px);
  margin-bottom: 0;
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

.vessel-photo-card {
  margin-top: 14px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
  padding: 14px;
}

.vessel-photo-card h3 {
  margin: 0 0 10px;
  color: #0f172a;
}

.vessel-photo-wrap {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  width: min(100%, 560px);
}

.vessel-photo {
  display: block;
  width: 100%;
  max-height: 340px;
  object-fit: cover;
}

.preview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 60;
}

.preview-modal {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 2;
  pointer-events: none;
}

.preview-header > * {
  pointer-events: auto;
}

.close-preview {
  border: none;
  background: #e2e8f0;
  color: #0f172a;
  border-radius: 999px;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
}

.preview-frame-wrap {
  position: absolute;
  inset: 0;
  border: none;
  border-radius: 0;
  overflow: hidden;
  background: transparent;
}

.preview-frame,
.preview-loading {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.preview-loading {
  display: grid;
  place-items: center;
  color: #475569;
  font-weight: 600;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
  position: absolute;
  left: 16px;
  bottom: 16px;
  max-width: min(100%, calc(100vw - 32px));
  padding: 12px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.24);
  z-index: 2;
  pointer-events: none;
}

.preview-actions > * {
  pointer-events: auto;
}

.preview-action-button {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border-radius: 999px;
  min-width: 88px;
  min-height: 40px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.preview-action-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.34);
}

.preview-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.preview-cancel-button {
  min-width: 44px;
  padding-inline: 0;
  font-size: 18px;
  line-height: 1;
}

.preview-actions .success,
.preview-actions .error,
.preview-actions > span {
  color: #ffffff;
  font-weight: 600;
}

.secondary-btn:hover:not(:disabled) {
  background: #dbeafe;
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

.owner-link {
  font-weight: 600;
}

.owner-card {
  display: grid;
  gap: 10px;
  width: 100%;
}

.owner-field {
  display: flex;
  align-items: baseline;
  gap: 10px;
  width: 100%;
}

.owner-field-label {
  font-size: 0.95rem;
  color: #475569;
  font-weight: 700;
  min-width: 72px;
}

.owner-field-value {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 600;
  flex: 1;
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

.related {
  margin-top: 24px;
}

.history-block + .history-block {
  margin-top: 18px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-header h4 {
  margin: 0;
  color: #0f172a;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.history-item {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr));
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.history-item:hover {
  transform: translateY(-2px);
  border-color: #bfdbfe;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.12);
}

.history-item.clickable:hover {
  cursor: pointer;
}

.empty-state {
  padding: 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #475569;
  background: #f8fafc;
  text-align: center;
}

.owner {
  color: #2563eb;
  cursor: pointer;
}

.ticket-item {
  color: inherit;
  cursor: pointer;
}

.error {
  color: #b91c1c;
}

@media (max-width: 1100px) {
  .back {
    position: static;
    margin-bottom: 12px;
  }

  .profile-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .preview-header {
    top: 12px;
    left: 12px;
    right: 12px;
  }

  .preview-actions {
    left: 12px;
    right: 12px;
    bottom: 12px;
  }
}
</style>
