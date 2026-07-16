<template>
  <main class="customer-profile">
    <button class="back" @click="goBack">← Back</button>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <section v-else-if="customer">
      <h2>{{ customer.name }}</h2>
      <div style="margin-top: 8px; margin-bottom: 12px">
        <button class="primary" @click="addNewVessel">Add New Vessel</button>
      </div>
      <ul class="details">
        <li><strong>ID:</strong> {{ customer.id }}</li>
        <li><strong>Phone:</strong> {{ customer.phone }}</li>
        <li><strong>Email:</strong> {{ customer.email }}</li>
        <li><strong>Address:</strong> {{ customer.address }}</li>
        <li><strong>Created:</strong> {{ customer.createdAt }}</li>
      </ul>
      <div class="vessel-list">
        <h3>Vessels</h3>
        <div v-if="vessels.length === 0">No vessels registered.</div>
        <ul v-else>
          <li v-for="v in vessels" :key="v.id" class="vessel-item clickable" @click="openVessel(v)">
            <strong>{{ v.vesselName }}</strong> — {{ v.vesselMake }} ({{ v.vesselYear }})
            <div class="small">
              Engine: {{ v.engineMake }} {{ v.engineModel }} — Hours: {{ v.engineHours }}
            </div>
          </li>
        </ul>
      </div>
    </section>
    <div v-else>No customer found.</div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import type { Customer, Vessel } from '@/types/mock'

export default defineComponent({
  setup() {
    const uiStore = useUiStore()
    const customerStore = useCustomerStore()
    const vesselStore = useVesselStore()
    const route = useRoute()
    const router = useRouter()
    const customer = ref<Customer | null>(null)
    const vessels = ref<Vessel[]>([])
    const loading = uiStore.loading
    const error = uiStore.error

    async function load() {
      try {
        await uiStore.fetchAllData()

        const id = String(route.query.id || '')
        if (!id) throw new Error('No customer id provided')

        customer.value = customerStore.customerById(id)
        vessels.value = vesselStore.vessels.filter((v) => v.customerId === id || v.owner === id)
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err)
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

    return {
      customer,
      vessels,
      loading,
      error,
      goBack,
      addNewVessel,
      openVessel,
    }
  },
})
</script>

<style scoped>
.customer-profile {
  padding: 12px;
}
.back {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  margin-bottom: 12px;
}
.details {
  list-style: none;
  padding: 0;
}
.details li {
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}
.vessel-list {
  margin-top: 16px;
}
.vessel-item {
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}
.error {
  color: #b91c1c;
}
</style>
