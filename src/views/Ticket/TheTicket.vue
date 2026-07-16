<template>
  <main class="ticket-page">
    <button class="back" @click="goBack">← Back</button>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <section v-else-if="ticket">
      <h1>{{ customerName }}</h1>
      <h2>{{ vesselName }}</h2>
      <h2>{{ ticket.service_title }}</h2>
      <ul class="ticket-details">
        <li><strong>ID:</strong> {{ ticket.id }}</li>
        <li><strong>Status:</strong> {{ ticket.status }}</li>
        <li><strong>Priority:</strong> {{ ticket.priority }}</li>
        <li><strong>Created:</strong> {{ ticket.createdAt }}</li>
        <li><strong>Scheduled:</strong> {{ ticket.scheduledDate }}</li>
        <li>
          <strong>Customer: </strong>
          <span class="link" @click="openCustomer">{{ customerName || ticket.customerId }}</span>
        </li>
        <li>
          <strong>Vessel: </strong>
          <span class="link" @click="openVessel">{{ vesselName || ticket.vesselId }}</span>
        </li>
        <li><strong>Notes:</strong> {{ ticket.notes }}</li>
      </ul>
    </section>
    <div v-else>No ticket found.</div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useTicketStore } from '@/stores/tickets'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import type { Ticket, Customer, Vessel } from '@/types/mock'

export default defineComponent({
  setup() {
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

    async function load() {
      loading.value = true
      try {
        const id = String(route.query.id || '')
        if (!id) throw new Error('No ticket id provided')

        await uiStore.fetchAllData()
        ticket.value = ticketStore.ticketById(id)

        if (!ticket.value) {
          throw new Error('Ticket not found')
        }

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

    onMounted(load)

    return { ticket, loading, error, goBack, openCustomer, openVessel, customerName, vesselName }
  },
})
</script>

<style scoped>
.ticket-page {
  padding: 12px;
}
.back {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  margin-bottom: 12px;
}
.ticket-details {
  list-style: none;
  padding: 0;
}
.ticket-details li {
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}
.link {
  color: #2563eb;
  cursor: pointer;
}
.error {
  color: #b91c1c;
}
</style>
