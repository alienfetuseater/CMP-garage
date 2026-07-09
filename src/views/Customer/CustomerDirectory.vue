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
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Customer, Vessel, VesselMap } from '@/types/mock'

export default defineComponent({
  setup() {
    const customers = ref<Customer[]>([])
    const vessels = ref<VesselMap | null>(null)
    const loading = ref(true)
    const error = ref<string | null>(null)

    const vesselsArr = computed(() =>
      vessels.value ? Object.values(vessels.value) : ([] as Vessel[]),
    )

    async function load() {
      loading.value = true
      try {
        // prefer localStorage override when present (registered without API)
        const local = localStorage.getItem('mockCustomers')
        if (local) {
          customers.value = JSON.parse(local)
        } else {
          const custRes = await fetch('/mock/customers.json')
          if (!custRes.ok) throw new Error('Failed to load customers')
          customers.value = await custRes.json()
        }

        const vesRes = await fetch('/mock/vessels.json')
        if (!vesRes.ok) throw new Error('Failed to load vessels')
        vessels.value = await vesRes.json()
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err)
      } finally {
        loading.value = false
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
