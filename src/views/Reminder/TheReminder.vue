<template>
  <main class="reminder-page">
    <div class="reminder-shell">
      <button class="back" @click="goBack">← Back</button>

      <div v-if="loading" class="status-card">Loading...</div>
      <div v-else-if="error" class="status-card error">{{ error }}</div>

      <section v-else-if="reminder" class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">Reminder profile</p>
            <h2>{{ reminder.title }}</h2>
          </div>

          <div class="reminder-badge">
            {{ reminder.completed ? 'Completed' : 'Open' }}
          </div>
        </header>

        <div class="owner-strip">
          <span class="owner-label">Related</span>
          <span class="related-type">{{ reminder.relatedTo?.type }}</span>

          <template v-if="reminder.relatedTo?.type === 'vessel'">
            <span class="owner-divider">•</span>
            <span class="owner-label">Vessel</span>
            <span class="clickable owner owner-link" @click="openVessel">
              {{ vesselName || reminder.relatedTo?.id }}
            </span>
          </template>

          <template v-else-if="reminder.relatedTo?.type === 'customer'">
            <span class="owner-divider">•</span>
            <span class="owner-label">Customer</span>
            <span class="clickable owner owner-link" @click="openOwner">
              {{ ownerName || reminder.relatedTo?.id }}
            </span>
          </template>

          <template v-if="ownerId && reminder.relatedTo?.type === 'vessel'">
            <span class="owner-divider">•</span>
            <span class="owner-label">Owner</span>
            <span class="clickable owner owner-link" @click="openOwner">
              {{ ownerName || ownerId }}
            </span>
          </template>
        </div>

        <ul class="details">
          <li><strong>ID</strong> {{ reminder.id }}</li>
          <li><strong>Due Date</strong> {{ reminder.dueDate }}</li>
          <li><strong>Completed</strong> {{ reminder.completed ? 'Yes' : 'No' }}</li>
          <li><strong>Related Type</strong> {{ reminder.relatedTo?.type }}</li>
        </ul>
      </section>

      <div v-else class="status-card">No reminder found.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useReminderStore } from '@/stores/reminders'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import type { Reminder } from '@/types/mock'

const uiStore = useUiStore()
const reminderStore = useReminderStore()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
const route = useRoute()
const router = useRouter()
const reminder = ref<Reminder | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const vesselName = ref<string | null>(null)
const vesselId = ref<string | null>(null)
const ownerId = ref<string | null>(null)
const ownerName = ref<string | null>(null)

async function load() {
  loading.value = true
  try {
    const id = String(route.query.id || '')
    if (!id) throw new Error('No reminder id provided')

    await uiStore.fetchAllData()
    reminder.value = reminderStore.reminderById(id)

    if (!reminder.value) {
      throw new Error('Reminder not found')
    }

    const customers = customerStore.customers
    const vessels = vesselStore.vessels

    const related = reminder.value.relatedTo
    if (related) {
      if (related.type === 'vessel') {
        const v = vessels.find((x) => x.id === related.id)
        if (v) {
          vesselId.value = v.id
          vesselName.value = v.vesselName
          ownerId.value = v.customerId ?? v.owner ?? null
          if (ownerId.value) {
            const c = customers.find((x) => x.id === ownerId.value)
            ownerName.value = c ? c.name : ownerId.value
          }
        }
      } else if (related.type === 'customer') {
        const cid = related.id
        ownerId.value = cid
        const c = customers.find((x) => x.id === cid)
        ownerName.value = c ? c.name : cid
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

function openVessel() {
  const vid = vesselId.value
  if (vid) router.push({ name: 'VesselProfile', query: { id: vid } })
}

function openOwner() {
  const cid = ownerId.value
  if (cid) router.push({ name: 'CustomerProfile', query: { id: cid } })
}

onMounted(load)
</script>

<style scoped>
.reminder-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.reminder-shell {
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

.reminder-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
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

.related-type {
  font-weight: 600;
  color: #0f172a;
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

.error {
  color: #b91c1c;
}

.link,
.owner {
  color: #2563eb;
  cursor: pointer;
}

.link:hover,
.owner:hover,
.back:hover {
  text-decoration: underline;
}
</style>
