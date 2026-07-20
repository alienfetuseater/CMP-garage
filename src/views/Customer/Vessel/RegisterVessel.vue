<template>
  <main class="vessel-registration-page">
    <div class="vessel-registration-shell">
      <button class="back" @click="goBack">← Back</button>

      <section class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">Vessel creation</p>
            <h2>Register Vessel</h2>
          </div>
        </header>

        <form class="registration-form" @submit.prevent="submit">
          <div class="form-grid">
            <label>
              Owner
              <select v-model="form.customerId" required>
                <option value="" disabled>Select owner</option>
                <option v-for="c in customers" :key="c.id" :value="c.id">
                  {{ c.name }}
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
          </div>

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
                {{
                  form.engineSerialNumbers[index] === 'Not Available' ? 'Use serial' : 'Mark N/A'
                }}
              </button>
            </div>
          </fieldset>
          <p v-else class="hint">Add the number of engines above to enter serial numbers.</p>

          <div class="actions">
            <button type="submit" class="primary" :disabled="loading">Create Vessel</button>
            <span v-if="loading">Saving...</span>
            <span v-if="success" class="success">Saved</span>
            <span v-if="error" class="error">{{ error }}</span>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiFetch } from '@/api'
import { useUiStore } from '@/stores/ui'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
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

const router = useRouter()
const route = useRoute()
const uiStore = useUiStore()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
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

function goBack() {
  router.back()
}

const editId = ref('')
const previousOwnerId = ref('')

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
  form.value.engineSerialNumbers[index] = current === 'Not Available' ? '' : 'Not Available'
}

const validateSerialNumbers = () => {
  if (!form.value.numberOfEngines || form.value.numberOfEngines <= 0) return true
  return form.value.engineSerialNumbers.every((serial) => String(serial).trim() !== '')
}

onMounted(async () => {
  try {
    customers.value = await customerStore.fetchCustomers()
  } catch {
    customers.value = []
  }

  const vesselId = String(route.query.id || route.query.vesselId || '')
  if (vesselId) {
    try {
      await uiStore.fetchAllData()
      const existing = vesselStore.vesselById(vesselId)
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
    if (!validateSerialNumbers()) {
      throw new Error('Please provide a serial number or mark N/A for every engine')
    }

    const customer = customers.value.find((c) => c.id === form.value.customerId)

    const payload = {
      customerId: form.value.customerId,
      owner: form.value.customerId,
      customerName: customer?.name ?? '',
      customerPhone: customer?.phone ?? '',
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
      vesselStore.addVessel(saved)
    } else {
      saved = await apiFetch<Vessel>('/newBoat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      vesselStore.addVessel(saved)
    }

    success.value = true
    const savedId = String(saved.id ?? (saved as Vessel & { _id?: string })._id ?? '')
    if (!savedId) {
      throw new Error('Vessel saved, but no vessel id was returned')
    }

    router.push({ name: 'VesselProfile', query: { id: savedId } })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.vessel-registration-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.vessel-registration-shell {
  width: min(100%, 920px);
}

.profile-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 24px;
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

.registration-form {
  display: grid;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #334155;
  font-weight: 600;
  min-width: 0;
}

input,
select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  background: #ffffff;
  color: #0f172a;
}

.engine-serials {
  margin: 4px 0 0;
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
}

.engine-serials legend {
  padding: 0 6px;
  color: #0f172a;
  font-weight: 700;
}

.engine-serial-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: end;
  margin-top: 12px;
}

.na-toggle {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 12px;
  padding: 12px 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.hint {
  margin: 0;
  color: #64748b;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.primary {
  border: 1px solid #1d4ed8;
  background: #2563eb;
  color: #ffffff;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
}

.success {
  color: #059669;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .engine-serial-row {
    grid-template-columns: 1fr;
  }
}
</style>
