<template>
  <main class="reminder-page">
    <button class="back" @click="goBack">← Back</button>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <section v-else-if="reminder">
      <h2>{{ reminder.title }}</h2>
      <ul class="reminder-details">
        <li><strong>ID:</strong> {{ reminder.id }}</li>
        <li><strong>Due Date:</strong> {{ reminder.dueDate }}</li>
        <li><strong>Completed:</strong> {{ reminder.completed ? 'Yes' : 'No' }}</li>
        <li><strong>Related Type:</strong> {{ reminder.relatedTo?.type }}</li>
        <li v-if="reminder.relatedTo?.type === 'vessel'">
          <strong>Vessel:</strong>
          <span class="link" @click="openVessel">{{ vesselName || reminder.relatedTo?.id }}</span>
        </li>
        <li v-else-if="reminder.relatedTo?.type === 'customer'">
          <strong>Customer:</strong>
          <span class="link" @click="openOwner">{{ ownerName || reminder.relatedTo?.id }}</span>
        </li>
        <li v-if="ownerId && reminder.relatedTo?.type === 'vessel'">
          <strong>Owner:</strong>
          <span class="link" @click="openOwner">{{ ownerName || ownerId }}</span>
        </li>
      </ul>
    </section>
    <div v-else>No reminder found.</div>
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
      throw new Error('reminder not found')
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

onMounted(load)

function openVessel() {
  const vid = vesselId.value
  if (vid) router.push({ name: 'VesselProfile', query: { id: vid } })
}

function openOwner() {
  const cid = ownerId.value
  if (cid) router.push({ name: 'CustomerProfile', query: { id: cid } })
}
</script>

<style scoped>
.reminder-page {
  padding: 12px;
}
.back {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  margin-bottom: 12px;
}
.reminder-details {
  list-style: none;
  padding: 0;
}
.reminder-details li {
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}
.error {
  color: #b91c1c;
}
</style>
