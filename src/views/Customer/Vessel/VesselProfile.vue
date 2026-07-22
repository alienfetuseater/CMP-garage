<template>
  <main class="vessel-profile">
    <div class="vessel-profile-shell">
      <button class="back" @click="goBack">← Back</button>

      <div v-if="loading" class="status-card">Loading...</div>
      <div v-else-if="error" class="status-card error">{{ error }}</div>

      <section v-else-if="vessel" class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">Vessel profile</p>
            <h2>{{ vessel.vesselName }}</h2>
          </div>

          <div class="header-actions">
            <button type="button" class="primary action-btn" @click="editVessel">
              Edit Vessel
            </button>
            <button type="button" class="primary action-btn secondary-btn" @click="createTicket">
              New Ticket
            </button>
          </div>
        </header>

        <div class="owner-strip">
          <div class="owner-card clickable" @click="openOwner">
            <div class="owner-field">
              <span class="owner-field-label">Name:</span>
              <span class="owner-field-value">{{ vessel.customerName }}</span>
            </div>

            <div class="owner-field">
              <span class="owner-field-label">Phone:</span>
              <span class="owner-field-value">{{ ownerPhone }}</span>
            </div>

            <div class="owner-field">
              <span class="owner-field-label">Address:</span>
              <span class="owner-field-value">{{ ownerAddress }}</span>
            </div>
          </div>
        </div>

        <ul class="details">
          <li><strong>Make</strong> {{ vessel.vesselMake }}</li>
          <li><strong>Year</strong> {{ vessel.vesselYear }}</li>
          <li><strong>Engine</strong> {{ vessel.engineMake }} {{ vessel.engineModel }}</li>
          <li><strong>Horsepower</strong> {{ vessel.engineHorsepower }}</li>
          <li><strong>Hours</strong> {{ vessel.engineHours }}</li>
        </ul>

        <section class="related">
          <div class="section-heading">
            <h3>Service History</h3>
          </div>

          <div class="history-block">
            <div class="history-header">
              <h4>Diagnostic History</h4>
              <span class="count">{{ diagnosticHistory.length }}</span>
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

          <div class="history-block">
            <div class="history-header">
              <h4>Repair History</h4>
              <span class="count">{{ repairHistory.length }}</span>
            </div>

            <div v-if="loadingTickets">Loading...</div>
            <div v-else>
              <ul v-if="repairHistory.length" class="history-list">
                <li
                  v-for="ticket in repairHistory"
                  :key="ticket.id"
                  class="history-item clickable"
                  @click="openTicket(ticket.id)"
                >
                  <strong>{{ ticket.service_title }}</strong>
                  <span>{{ ticket.status }}</span>
                  <span>{{ ticket.priority }}</span>
                  <span>{{ formatLocalDateTime(ticket.scheduledDate) }}</span>
                </li>
              </ul>
              <div v-else class="empty-state">No repairs for this vessel.</div>
            </div>
          </div>

          <div class="history-block">
            <div class="history-header">
              <h4>Maintenance History</h4>
              <span class="count">{{ maintenanceHistory.length }}</span>
            </div>

            <div v-if="loadingTickets">Loading...</div>
            <div v-else>
              <ul v-if="maintenanceHistory.length" class="history-list">
                <li
                  v-for="ticket in maintenanceHistory"
                  :key="ticket.id"
                  class="history-item clickable"
                  @click="openTicket(ticket.id)"
                >
                  <strong>{{ ticket.service_title }}</strong>
                  <span>{{ ticket.status }}</span>
                  <span>{{ ticket.priority }}</span>
                  <span>{{ formatLocalDateTime(ticket.scheduledDate) }}</span>
                </li>
              </ul>
              <div v-else class="empty-state">No maintenance jobs for this vessel.</div>
            </div>
          </div>

          <div class="history-block">
            <div class="history-header">
              <h4>Upgrades History</h4>
              <span class="count">{{ upgradeHistory.length }}</span>
            </div>

            <div v-if="loadingTickets">Loading...</div>
            <div v-else>
              <ul v-if="upgradeHistory.length" class="history-list">
                <li
                  v-for="ticket in upgradeHistory"
                  :key="ticket.id"
                  class="history-item clickable"
                  @click="openTicket(ticket.id)"
                >
                  <strong>{{ ticket.service_title }}</strong>
                  <span>{{ ticket.status }}</span>
                  <span>{{ ticket.priority }}</span>
                  <span>{{ formatLocalDateTime(ticket.scheduledDate) }}</span>
                </li>
              </ul>
              <div v-else class="empty-state">No upgrades for this vessel.</div>
            </div>
          </div>
        </section>
      </section>

      <div v-else class="status-card">No vessel found.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import { useTicketStore } from '@/stores/tickets'
import type { Vessel, Ticket } from '@/types/mock'
import { formatLocalDateTime } from '@/utils/datetime'

const uiStore = useUiStore()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
const ticketStore = useTicketStore()
const route = useRoute()
const router = useRouter()

const vessel = ref<Vessel | null>(null)
const ticketsForVessel = ref<Ticket[]>([])

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

onMounted(load)
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

.action-btn {
  white-space: nowrap;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.secondary-btn {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
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

.section-heading h3 {
  margin: 0 0 14px;
  color: #0f172a;
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

.count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 10px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
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
}
</style>
