<template>
  <main class="customer-directory">
    <header class="directory-header">
      <p class="eyebrow">Directory</p>
      <h2>Customers and Vessels</h2>
      <p class="subtitle">Open a profile from either list to view full details and history.</p>
    </header>

    <section class="lists">
      <div class="panel">
        <div class="panel-head">
          <h3>Customers</h3>
          <span class="count">{{ customers.length }}</span>
        </div>

        <div v-if="loading" class="status">Loading customers...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="customers.length === 0" class="status empty">No customers yet.</div>
        <ul v-else class="item-list">
          <li
            v-for="customer in customers"
            :key="customer.id"
            class="directory-item clickable"
            @click="openCustomer(customer)"
          >
            <div class="item-title-row">
              <strong>{{ customer.name }}</strong>
            </div>
            <div class="item-meta">
              <span>Phone: {{ formatPhone(customer.phone) || 'No phone' }}</span>
              <span>Email: {{ customer.email || 'No email' }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Vessels</h3>
          <span class="count">{{ vesselsArr.length }}</span>
        </div>

        <div v-if="loading" class="status">Loading vessels...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="vesselsArr.length === 0" class="status empty">No vessels yet.</div>
        <ul v-else class="item-list">
          <li
            v-for="v in vesselsArr"
            :key="v.id"
            class="directory-item clickable"
            @click="openVessel(v)"
          >
            <div class="item-title-row">
              <strong>{{ v.vesselName }}</strong>
              <span class="small">{{ v.vesselMake }} ({{ v.vesselYear }})</span>
            </div>
            <div class="item-meta">
              <span>Owner: {{ getVesselOwner(v) }}</span>
              <span>Phone: {{ getVesselPhone(v) }}</span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import type { Customer, Vessel } from '@/types/mock'

const uiStore = useUiStore()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
const route = useRoute()
const customers = customerStore.customers
const vesselsArr = computed(() => vesselStore.vessels)
const loading = computed(() => uiStore.loading)
const error = computed(() => uiStore.error)

type CustomerWithOptionalMongoId = Customer & { _id?: string }

const customersByLinkKey = computed(() => {
  const map = new Map<string, CustomerWithOptionalMongoId>()

  for (const customer of customers as CustomerWithOptionalMongoId[]) {
    const customerId = String(customer.id || '').trim()
    const mongoId = String(customer._id || '').trim()

    if (customerId) map.set(customerId, customer)
    if (mongoId) map.set(mongoId, customer)
  }

  return map
})

const customersByName = computed(() => {
  const map = new Map<string, CustomerWithOptionalMongoId>()
  for (const customer of customers as CustomerWithOptionalMongoId[]) {
    const key = normalizeName(customer.name)
    if (key && !map.has(key)) {
      map.set(key, customer)
    }
  }
  return map
})

async function load() {
  try {
    await uiStore.fetchAllData(true)
  } catch (err) {
    console.error(err)
  }
}

watch(
  () => route.fullPath,
  () => {
    load()
  },
  { immediate: true },
)

const router = useRouter()

function openCustomer(customer: Customer) {
  router.push({ name: 'CustomerProfile', query: { id: customer.id } })
}

function openVessel(vessel: Vessel) {
  router.push({ name: 'VesselProfile', query: { id: vessel.id } })
}

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

function normalizeName(value?: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function getCustomerForVessel(vessel: Vessel) {
  const customerId = String(vessel.customerId || '').trim()
  if (customerId) {
    const byId = customersByLinkKey.value.get(customerId)
    if (byId) return byId
  }

  const ownerName = normalizeName(vessel.customerName)
  if (ownerName) {
    const byName = customersByName.value.get(ownerName)
    if (byName) return byName
  }

  return null
}

function getVesselOwner(vessel: Vessel) {
  return getCustomerForVessel(vessel)?.name || vessel.customerName || 'Unknown'
}

function getVesselPhone(vessel: Vessel) {
  const customerPhone = getCustomerForVessel(vessel)?.phone
  const resolvedPhone = customerPhone || vessel.customerPhone || ''
  const formatted = formatPhone(resolvedPhone)
  return formatted || 'N/A'
}
</script>

<style scoped>
.customer-directory {
  --page-chrome-height: 72px;
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.directory-header {
  min-height: var(--page-chrome-height);
  max-width: 1120px;
  margin: 0 auto 16px;
}

.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #64748b;
}

.directory-header h2 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.1;
  color: #0f172a;
}

.subtitle {
  margin: 8px 0 0;
  color: #475569;
}

.lists {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.panel {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.panel-head h3 {
  margin: 0;
  color: #0f172a;
}

.count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0 8px;
}

.status {
  color: #475569;
  padding: 8px 0;
}

.empty {
  color: #64748b;
}

.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.directory-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
  transition:
    border-color 120ms ease,
    transform 120ms ease,
    box-shadow 120ms ease;
}

.directory-item:hover {
  border-color: #93c5fd;
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.12);
}

.item-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.item-title-row strong {
  color: #0f172a;
}

.item-meta {
  margin-top: 6px;
  display: grid;
  gap: 4px;
  color: #475569;
}

.small {
  font-size: 0.85rem;
  color: #6b7280;
}

.error {
  color: #b91c1c;
}

@media (max-width: 920px) {
  .lists {
    grid-template-columns: 1fr;
  }
}
</style>
