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
        Hull ID Number
        <input v-model="form.hullIdNumber" />
      </label>

      <label>
        Number of Engines
        <input v-model.number="form.numberOfEngines" type="number" min="0" />
      </label>

      <fieldset class="engine-serials" v-if="form.numberOfEngines && form.numberOfEngines > 0">
        <legend>Engine Serial Numbers</legend>
        <div
          v-for="(serial, index) in form.engineSerialNumbers"
          :key="index"
          class="engine-serial-row"
        >
          <label>
            Engine {{ index + 1 }} Serial Number
            <input
              v-model="form.engineSerialNumbers[index]"
              :disabled="form.engineSerialNumbers[index] === 'Not Available'"
              placeholder="Enter serial number"
            />
          </label>
          <button type="button" class="na-toggle" @click="toggleSerialNotAvailable(index)">
            {{ form.engineSerialNumbers[index] === 'Not Available' ? 'Use serial' : 'Mark N/A' }}
          </button>
        </div>
      </fieldset>
      <p v-else class="hint">Add the number of engines above to enter serial numbers.</p>

      <label>
        Generator
        <select v-model="form.generator">
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </label>

      <label>
        Boat Location
        <select v-model="form.boatLocation">
          <option value="" disabled>Select location</option>
          <option value="trailor">trailor</option>
          <option value="slip">slip</option>
          <option value="dry dock">dry dock</option>
        </select>
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
import { defineComponent, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiFetch } from '@/api'
import { useDataStore } from '@/stores/data'
import type { Customer, Vessel } from '@/types/mock'

type Form = {
  customerId: string
  vesselName: string
  vesselMake: string
  vesselYear: number | null
  hullIdNumber: string
  numberOfEngines: number | null
  engineSerialNumbers: string[]
  generator: 'yes' | 'no'
  boatLocation: 'trailor' | 'slip' | 'dry dock' | ''
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
    const store = useDataStore()
    const customers = ref<Customer[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const success = ref(false)

    const form = ref<Form>({
      customerId: '',
      vesselName: '',
      vesselMake: '',
      vesselYear: null,
      hullIdNumber: '',
      numberOfEngines: null,
      engineSerialNumbers: [],
      generator: 'no',
      boatLocation: '',
      engineMake: '',
      engineModel: '',
      engineHours: null,
    })

    const editId = ref('')
    const previousOwnerId = ref('')
    const route = useRoute()

    watch(
      () => form.value.numberOfEngines,
      (value) => {
        const count = Math.max(0, value ?? 0)
        while (form.value.engineSerialNumbers.length < count) {
          form.value.engineSerialNumbers.push('')
        }
        while (form.value.engineSerialNumbers.length > count) {
          form.value.engineSerialNumbers.splice(count)
        }
      },
      { immediate: true },
    )

    const toggleSerialNotAvailable = (index: number) => {
      const current = form.value.engineSerialNumbers[index] || ''
      if (current === 'Not Available') {
        form.value.engineSerialNumbers[index] = ''
      } else {
        form.value.engineSerialNumbers[index] = 'Not Available'
      }
    }

    const validateSerialNumbers = () => {
      if (!form.value.numberOfEngines || form.value.numberOfEngines <= 0) return true
      return form.value.engineSerialNumbers.every((serial) => String(serial).trim() !== '')
    }

    onMounted(async () => {
      try {
        customers.value = await store.fetchCustomers()
      } catch {
        customers.value = []
      }

      const vesselId = String(route.query.id || route.query.vesselId || '')
      if (vesselId) {
        try {
          await store.fetchAllData()
          const existing = store.vesselById(vesselId)
          if (!existing) throw new Error('Vessel not found')
          editId.value = vesselId
          previousOwnerId.value = existing.customerId
          form.value.customerId = existing.customerId
          form.value.vesselName = existing.vesselName
          form.value.vesselMake = existing.vesselMake
          form.value.vesselYear = existing.vesselYear
          form.value.hullIdNumber = existing.hullIdNumber
          form.value.numberOfEngines = existing.numberOfEngines
          form.value.engineSerialNumbers = existing.engineSerialNumbers.slice()
          form.value.generator = existing.generator ? 'yes' : 'no'
          form.value.boatLocation = existing.boatLocation
          form.value.engineMake = existing.engineMake
          form.value.engineModel = existing.engineModel
          form.value.engineHours = existing.engineHours
        } catch {
          // ignore failure to load existing vessel
        }
      }

      const ownerId = String(route.query.ownerId || '')
      if (ownerId) form.value.customerId = ownerId
    })

    async function submit() {
      loading.value = true
      error.value = null
      success.value = false

      try {
        if (!form.value.customerId) throw new Error('Owner is required')
        if (!validateSerialNumbers())
          throw new Error('Please provide a serial number or mark N/A for every engine')

        const payload = {
          customerId: form.value.customerId,
          owner: form.value.customerId,
          customerName: customers.value.find((c) => c.id === form.value.customerId)?.name ?? '',
          customerPhone: customers.value.find((c) => c.id === form.value.customerId)?.phone ?? '',
          vesselName: form.value.vesselName,
          vesselMake: form.value.vesselMake,
          vesselYear: form.value.vesselYear ?? 0,
          hullIdNumber: form.value.hullIdNumber,
          numberOfEngines: form.value.numberOfEngines ?? 0,
          engineSerialNumbers: form.value.engineSerialNumbers.slice(),
          generator: form.value.generator === 'yes',
          boatLocation: form.value.boatLocation,
          engineMake: form.value.engineMake,
          engineModel: form.value.engineModel,
          engineHours: form.value.engineHours ?? 0,
        }

        let saved: Vessel
        if (editId.value) {
          saved = await apiFetch<Vessel>(`/updateBoat/${encodeURIComponent(editId.value)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          store.addVessel(saved)
        } else {
          saved = await apiFetch<Vessel>('/newBoat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          store.addVessel(saved)
        }

        success.value = true
        router.push({ name: 'VesselProfile', query: { id: saved.id } })
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err)
      } finally {
        loading.value = false
      }
    }

    return { customers, form, loading, error, success, submit, toggleSerialNotAvailable }
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
