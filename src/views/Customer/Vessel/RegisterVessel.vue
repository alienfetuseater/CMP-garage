<template>
  <main>
    <h2>Register Vessel</h2>

    <form @submit.prevent="submit">
      <label>
        Owner
        <select v-model="form.customerId" required>
          <option value="" disabled>Select owner</option>
          <option v-for="c in customers" :key="c.id" :value="c.id">
            {{ c.name }} — {{ c.phone }}
          </option>
        </select>
      </label>

      <label>
        Vessel Name
        <input v-model="form.vesselName" required />
      </label>

      <label>
        Make
        <input v-model="form.vesselMake" />
      </label>

      <label>
        Year
        <input v-model.number="form.vesselYear" type="number" />
      </label>

      <label>
        Engine Make
        <input v-model="form.engineMake" />
      </label>

      <label>
        Engine Model
        <input v-model="form.engineModel" />
      </label>

      <label>
        Engine Hours
        <input v-model.number="form.engineHours" type="number" />
      </label>

      <div class="actions">
        <button type="submit" :disabled="loading">Create Vessel</button>
        <span v-if="loading">Saving...</span>
        <span v-if="success" class="success">Saved</span>
        <span v-if="error" class="error">{{ error }}</span>
      </div>
    </form>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Customer, Vessel } from '@/types/mock'

type Form = {
  customerId: string
  vesselName: string
  vesselMake: string
  vesselYear: number | null
  engineMake: string
  engineModel: string
  engineHours: number | null
}

function downloadJSON(filename: string, data: unknown) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    /* ignore */
  }
}

export default defineComponent({
  setup() {
    const router = useRouter()
    const customers = ref<Customer[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const success = ref(false)

    const form = ref<Form>({
      customerId: '',
      vesselName: '',
      vesselMake: '',
      vesselYear: null,
      engineMake: '',
      engineModel: '',
      engineHours: null,
    })

    onMounted(async () => {
      const local = localStorage.getItem('mockCustomers')
      if (local) {
        try {
          customers.value = JSON.parse(local)
        } catch {
          customers.value = []
        }
      } else {
        const res = await fetch('/mock/customers.json')
        if (res.ok) customers.value = await res.json()
      }
      // prefill owner if provided in route query
      const route = useRoute()
      const ownerId = String(route.query.ownerId || '')
      if (ownerId) form.value.customerId = ownerId
    })

    async function submit() {
      loading.value = true
      error.value = null
      success.value = false

      try {
        if (!form.value.customerId) throw new Error('Owner is required')

        // load existing vessels
        let map: Record<string, Vessel> = {}
        const localV = localStorage.getItem('mockVessels')
        if (localV) {
          try {
            map = JSON.parse(localV)
          } catch {
            map = {}
          }
        } else {
          const vres = await fetch('/mock/vessels.json')
          if (vres.ok) map = await vres.json()
        }

        const id = `vess-${String(Math.floor(Math.random() * 90000) + 10000)}`
        const ownerId = form.value.customerId
        const owner = customers.value.find((c) => c.id === ownerId)

        const newVessel: Vessel = {
          id,
          customerId: ownerId,
          owner: ownerId,
          customerName: owner ? owner.name : '',
          customerPhone: owner ? owner.phone : '',
          vesselName: form.value.vesselName,
          vesselMake: form.value.vesselMake,
          vesselYear: form.value.vesselYear ?? 0,
          engineMake: form.value.engineMake,
          engineModel: form.value.engineModel,
          engineHours: form.value.engineHours ?? 0,
        }

        map[id] = newVessel
        localStorage.setItem('mockVessels', JSON.stringify(map))

        // update customers list to include vessel id
        let custList: Customer[] = []
        const localC = localStorage.getItem('mockCustomers')
        if (localC) {
          try {
            custList = JSON.parse(localC)
          } catch {
            custList = customers.value.slice()
          }
        } else {
          const cres = await fetch('/mock/customers.json')
          if (cres.ok) custList = await cres.json()
          else custList = customers.value.slice()
        }

        const ci = custList.find((c) => c.id === ownerId)
        if (ci) {
          ci.vesselIds = ci.vesselIds ?? []
          ci.vesselIds.push(id)
        }

        localStorage.setItem('mockCustomers', JSON.stringify(custList))

        // offer downloads so developer can persist changes manually
        downloadJSON('vessels.updated.json', map)
        downloadJSON('customers.updated.json', custList)

        success.value = true
        // route to vessel profile
        router.push({ name: 'VesselProfile', query: { id } })
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err)
      } finally {
        loading.value = false
      }
    }

    return { customers, form, loading, error, success, submit }
  },
})
</script>

<style scoped>
.actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
}
.error {
  color: #b91c1c;
}
.success {
  color: #059669;
}
label {
  display: block;
  margin: 8px 0;
}
input,
select {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
}
</style>
