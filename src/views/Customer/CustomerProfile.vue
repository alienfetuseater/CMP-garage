<template>
  <main class="customer-profile">
    <div class="customer-profile-shell">
      <button class="back" @click="goBack">← Back</button>

      <div v-if="loading" class="status-card">Loading...</div>
      <div v-else-if="error" class="status-card error">{{ error }}</div>

      <section v-else-if="customer" class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">Customer profile</p>
            <h2>{{ customer.name }}</h2>
          </div>

          <button class="primary action-btn" @click="addNewVessel">Add New Vessel</button>
        </header>

        <ul class="details">
          <li><strong>Phone</strong> {{ customer.phone }}</li>
          <li><strong>Email</strong> {{ customer.email }}</li>
          <li><strong>Address</strong> {{ customer.address }}</li>
          <li><strong>Profile created</strong> {{ customer.createdAt }}</li>
        </ul>

        <div class="vessel-list">
          <div class="section-heading">
            <h3>Vessels</h3>
            <span class="count">{{ vessels.length }}</span>
          </div>

          <div v-if="vessels.length === 0" class="empty-state">No vessels registered.</div>

          <ul v-else class="vessel-grid">
            <li
              v-for="v in vessels"
              :key="v.id"
              class="vessel-item clickable"
              @click="openVessel(v)"
            >
              <strong>{{ v.vesselName }}</strong>
              <span class="vessel-meta">{{ v.vesselMake }} · {{ v.vesselYear }}</span>
              <div class="small">
                Engine: {{ v.engineMake }} {{ v.engineModel }} · Hours: {{ v.engineHours }}
              </div>
            </li>
          </ul>
        </div>
      </section>

      <div v-else class="status-card">No customer found.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import type { Customer, Vessel } from '@/types/mock'

const uiStore = useUiStore()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
const route = useRoute()
const router = useRouter()

const customer = ref<Customer | null>(null)
const vessels = ref<Vessel[]>([])

const loading = computed(() => uiStore.loading)
const error = computed(() => uiStore.error)

async function load() {
  try {
    await uiStore.fetchAllData()

    const id = String(route.query.id || '')
    if (!id) throw new Error('No customer id provided')

    customer.value = customerStore.customerById(id)
    const matchedCustomer = customer.value

    vessels.value = vesselStore.vessels.filter((v) => {
      if (String(v.customerId) === String(id) || String(v.owner) === String(id)) return true
      if (!matchedCustomer) return false

      const vesselCustomerName = String(v.customerName || '')
        .trim()
        .toLowerCase()
      const vesselCustomerPhone = String(v.customerPhone || '')
        .trim()
        .toLowerCase()
      const customerName = String(matchedCustomer.name || '')
        .trim()
        .toLowerCase()
      const customerPhone = String(matchedCustomer.phone || '')
        .trim()
        .toLowerCase()

      return vesselCustomerName === customerName || vesselCustomerPhone === customerPhone
    })
  } catch (err) {
    uiStore.error = err instanceof Error ? err.message : String(err)
  }
}

function goBack() {
  router.push({ name: 'CustomerDirectory' })
}

function addNewVessel() {
  if (!customer.value) return
  router.push({ name: 'RegisterVessel', query: { ownerId: customer.value.id } })
}

function openVessel(v: Vessel) {
  router.push({ name: 'VesselProfile', query: { id: v.id } })
}

onMounted(load)
</script>

<style scoped>
.customer-profile {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.customer-profile-shell {
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
  margin-bottom: 20px;
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

.vessel-list {
  margin-top: 24px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-heading h3 {
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

.empty-state {
  padding: 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #475569;
  background: #f8fafc;
  text-align: center;
}

.vessel-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.vessel-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.vessel-item:hover {
  transform: translateY(-2px);
  border-color: #bfdbfe;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.12);
}

.vessel-meta {
  display: block;
  margin-top: 6px;
  color: #475569;
  font-size: 0.95rem;
}

.small {
  margin-top: 6px;
  color: #64748b;
  font-size: 0.9rem;
}

.error {
  color: #b91c1c;
}
</style>
