<template>
  <main class="customer-directory">
    <h2>Customer Directory</h2>

    <section class="lists">
      <div class="panel">
        <h3>Customers</h3>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <ul v-else>
          <li
            v-for="customer in customers"
            :key="customer.id"
            class="clickable"
            @click="openCustomer(customer)"
          >
            <strong>{{ customer.name }}</strong> — {{ customer.phone }} — {{ customer.email }}
          </li>
        </ul>
      </div>

      <div class="panel">
        <h3>Vessels</h3>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <ul v-else>
          <li v-for="v in vesselsArr" :key="v.id" class="clickable" @click="openVessel(v)">
            <strong>{{ v.vesselName }}</strong> — {{ v.vesselMake }} ({{ v.vesselYear }})
            <div class="small">Owner: {{ v.customerName }} — Phone: {{ v.customerPhone }}</div>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import type { Customer, Vessel } from '@/types/mock'

export default defineComponent({
  setup() {
    const store = useDataStore()
    const customers = store.customers
    const vesselsArr = computed(() => store.vessels)
    const loading = store.loading
    const error = store.error

    async function load() {
      try {
        await Promise.all([store.fetchCustomers(), store.fetchVessels()])
      } catch (err) {
        console.error(err)
      }
    }

    onMounted(load)

    const router = useRouter()

    function openCustomer(customer: Customer) {
      router.push({ name: 'CustomerProfile', query: { id: customer.id } })
    }

    function openVessel(vessel: Vessel) {
      router.push({ name: 'VesselProfile', query: { id: vessel.id } })
    }

    return {
      customers,
      vesselsArr,
      loading,
      error,
      openCustomer,
      openVessel,
    }
  },
})
</script>

<style scoped>
.customer-directory {
  padding: 12px;
}
.lists {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.panel {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.small {
  font-size: 0.85rem;
  color: #6b7280;
}
.error {
  color: #b91c1c;
}
</style>
