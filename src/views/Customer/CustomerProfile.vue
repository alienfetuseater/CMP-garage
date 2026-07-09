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
import type { Customer, Vessel, VesselMap } from '@/types/mock'

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const customer = ref<Customer | null>(null)
    const vessels = ref<Vessel[]>([])
    const loading = ref(true)
    const error = ref<string | null>(null)

    async function load() {
      loading.value = true
      try {
        const id = String(route.query.id || '')
        if (!id) throw new Error('No customer id provided')

        // prefer localStorage override when present
        const local = localStorage.getItem('mockCustomers')
        if (local) {
          const list: Customer[] = JSON.parse(local)
          customer.value = list.find((c) => c.id === id) ?? null
        } else {
          const res = await fetch('/mock/customers.json')
          if (!res.ok) throw new Error('Failed to load customers')
          const list: Customer[] = await res.json()
          customer.value = list.find((c) => c.id === id) ?? null
        }

        // load vessels and filter by owner or customerId
        try {
          const vres = await fetch('/mock/vessels.json')
          if (vres.ok) {
            const map: VesselMap = await vres.json()
            const all = Object.values(map)
            function hasOwner(x: unknown): x is { owner: string } {
              return (
                typeof x === 'object' &&
                x !== null &&
                'owner' in x &&
                typeof (x as Record<string, unknown>)['owner'] === 'string'
              )
            }

            vessels.value = all.filter(
              (v) => v.customerId === id || (hasOwner(v) && v.owner === id),
            )
          }
        } catch (vErr) {
          // ignore vessel load errors, user still sees customer
          console.warn('Failed to load vessels', vErr)
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err)
      } finally {
        loading.value = false
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
