<template>
  <main class="vessel-registration-page">
    <div class="vessel-registration-shell">
      <button class="back" @click="goBack">← Back</button>

      <section class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">Vessel creation</p>
            <h2>Register Vessel</h2>
            <p class="customer-subtitle" v-if="customerSubtitle">{{ customerSubtitle }}</p>
          </div>
        </header>

        <form class="registration-form" @submit.prevent="submit">
          <vessel-identity-section
            :model-value="form"
            :popular-boat-makes="popularBoatMakes"
            :popular-engine-makes="popularEngineMakes"
            @update:modelValue="updateForm"
          />

          <vessel-photo-section
            :model-value="form.boatPhotoDataUrl"
            @update:modelValue="form.boatPhotoDataUrl = $event"
            @error="handlePhotoError"
          />

          <div class="actions">
            <button type="submit" class="primary" :disabled="loading">
              {{ editId ? 'Update Vessel' : 'Create Vessel' }}
            </button>
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
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import VesselIdentitySection from '@/components/Vessel/VesselIdentitySection.vue'
import VesselPhotoSection from '@/components/Vessel/VesselPhotoSection.vue'
import { apiFetch } from '@/services/http/client'
import { useUiStore } from '@/stores/ui'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import type { Customer, Vessel } from '@/types/mock'

type Form = {
  customerId: string
  vesselName: string
  vesselMakeSelection: string
  vesselMakeOther: string
  vesselYear: number | null
  hullIdNumber: string
  numberOfEngines: number | null
  engineSerialNumbers: string[]
  generator: 'yes' | 'no'
  boatLocation: 'trailor' | 'slip' | 'dry dock' | ''
  engineMakeSelection: string
  engineMakeOther: string
  engineModel: string
  engineHorsepower: number | null
  engineHours: number | null
  boatPhotoDataUrl: string
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
const customerSubtitle = computed(() => {
  const customer = customers.value.find((entry) => entry.id === form.value.customerId)
  return customer ? `Customer: ${customer.name}` : ''
})

const popularBoatMakes = [
  'Boston Whaler',
  'Sea Ray',
  'Bayliner',
  'Yamaha Boats',
  'MasterCraft',
  'Malibu',
  'Chaparral',
  'Grady-White',
  'Pursuit',
  'Yellowfin',
  'Regal',
  'Cobalt',
  'Lund',
  'Ranger Boats',
  'Tracker',
  'Bennington',
  'Harris',
  'Sun Tracker',
  'Skeeter',
  'Nautique',
  'Carolina Skiff',
] as const

const popularEngineMakes = [
  'Yamaha',
  'Mercury',
  'Suzuki',
  'Honda Marine',
  'Evinrude',
  'Tohatsu',
  'Volvo Penta',
  'Ilmor',
  'PCM',
  'Indmar',
  'Caterpillar Marine',
  'Cummins Marine',
  'MAN',
  'Scania Marine',
  'MTU',
  'Yanmar',
  'Kawasaki Jet Ski',
  'Rotax',
] as const

const form = ref<Form>({
  customerId: '',
  vesselName: '',
  vesselMakeSelection: '',
  vesselMakeOther: '',
  vesselYear: null,
  hullIdNumber: '',
  numberOfEngines: null,
  engineSerialNumbers: [],
  generator: 'no',
  boatLocation: '',
  engineMakeSelection: '',
  engineMakeOther: '',
  engineModel: '',
  engineHorsepower: null,
  engineHours: null,
  boatPhotoDataUrl: '',
})

function updateForm(next: Form) {
  form.value = next
}

function handlePhotoError(message: string) {
  error.value = message
}

function goBack() {
  router.back()
}

const editId = ref('')
const previousOwnerId = ref('')

const resolveMakeSelection = (make: string) => {
  const trimmed = String(make || '').trim()
  if (!trimmed) {
    return { selection: '', other: '' }
  }

  const matchingPopularMake = popularBoatMakes.find(
    (option) => option.toLowerCase() === trimmed.toLowerCase(),
  )
  if (matchingPopularMake) {
    return { selection: matchingPopularMake, other: '' }
  }

  return { selection: 'other', other: trimmed }
}

const resolveEngineMakeSelection = (make: string) => {
  const trimmed = String(make || '').trim()
  if (!trimmed) {
    return { selection: '', other: '' }
  }

  const matchingPopularMake = popularEngineMakes.find(
    (option) => option.toLowerCase() === trimmed.toLowerCase(),
  )
  if (matchingPopularMake) {
    return { selection: matchingPopularMake, other: '' }
  }

  return { selection: 'other', other: trimmed }
}

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
      const makeSelection = resolveMakeSelection(existing.vesselMake)
      form.value.vesselMakeSelection = makeSelection.selection
      form.value.vesselMakeOther = makeSelection.other
      form.value.vesselYear = existing.vesselYear
      form.value.hullIdNumber = existing.hullIdNumber
      form.value.numberOfEngines = existing.numberOfEngines
      form.value.engineSerialNumbers = existing.engineSerialNumbers.slice()
      form.value.generator = existing.generator ? 'yes' : 'no'
      form.value.boatLocation = existing.boatLocation
      const engineMakeSelection = resolveEngineMakeSelection(existing.engineMake)
      form.value.engineMakeSelection = engineMakeSelection.selection
      form.value.engineMakeOther = engineMakeSelection.other
      form.value.engineModel = existing.engineModel
      form.value.engineHorsepower = existing.engineHorsepower ?? null
      form.value.engineHours = existing.engineHours
      form.value.boatPhotoDataUrl = String(existing.boatPhotoDataUrl || '')
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
    const selectedMake = String(form.value.vesselMakeSelection || '').trim()
    const customMake = String(form.value.vesselMakeOther || '').trim()
    const finalVesselMake = selectedMake === 'other' ? customMake : selectedMake
    const selectedEngineMake = String(form.value.engineMakeSelection || '').trim()
    const customEngineMake = String(form.value.engineMakeOther || '').trim()
    const finalEngineMake = selectedEngineMake === 'other' ? customEngineMake : selectedEngineMake

    if (selectedMake === 'other' && !customMake) {
      throw new Error('Please enter a make when selecting Other')
    }

    if (selectedEngineMake === 'other' && !customEngineMake) {
      throw new Error('Please enter an engine make when selecting Other')
    }

    if (!validateSerialNumbers()) {
      throw new Error('Please provide a serial number or mark N/A for every engine')
    }

    const horsepower = form.value.engineHorsepower
    if (horsepower !== null && !Number.isInteger(horsepower)) {
      throw new Error('Engine horsepower must be an integer')
    }

    const customer = customers.value.find((c) => c.id === form.value.customerId)

    const payload = {
      customerId: form.value.customerId,
      owner: form.value.customerId,
      customerName: customer?.name ?? '',
      customerPhone: customer?.phone ?? '',
      vesselName: form.value.vesselName,
      vesselMake: finalVesselMake,
      vesselYear: form.value.vesselYear ?? 0,
      hullIdNumber: form.value.hullIdNumber,
      numberOfEngines: form.value.numberOfEngines ?? 0,
      engineSerialNumbers: form.value.engineSerialNumbers.slice(),
      generator: form.value.generator === 'yes',
      boatLocation: form.value.boatLocation,
      engineMake: finalEngineMake,
      engineModel: form.value.engineModel,
      engineHorsepower: form.value.engineHorsepower ?? 0,
      engineHours: form.value.engineHours ?? 0,
      boatPhotoDataUrl: form.value.boatPhotoDataUrl,
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
  position: relative;
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
  color: var(--color-ocean-dark);
  cursor: pointer;
  position: absolute;
  top: 6px;
  right: calc(100% + 16px);
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

.customer-subtitle {
  margin: 6px 0 0;
  color: #475569;
  font-weight: 600;
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

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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

.photo-section {
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
  padding: 16px;
  display: grid;
  gap: 12px;
}

.photo-title {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.photo-preview-wrap {
  width: min(100%, 420px);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #ffffff;
}

.photo-preview {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.photo-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.secondary {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}

.secondary.danger {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.primary {
  border: 1px solid var(--color-ocean-deep);
  background: var(--color-ocean-dark);
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

@media (max-width: 1100px) {
  .back {
    position: static;
    margin-bottom: 16px;
  }
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
