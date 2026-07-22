<template>
  <main class="customer-registration-page">
    <div class="customer-registration-shell">
      <button class="back" @click="goBack">← Back</button>

      <section class="profile-card">
        <header class="profile-header">
          <div>
            <p class="eyebrow">{{ pageEyebrow }}</p>
            <h2>{{ pageTitle }}</h2>
          </div>
        </header>

        <form class="registration-form" @submit.prevent="submit">
          <div class="form-grid">
            <label>
              Name
              <input v-model="form.name" required />
            </label>

            <label>
              Phone
              <input v-model="form.phone" />
            </label>

            <label>
              Email
              <input v-model="form.email" type="email" />
            </label>

            <label>
              Street Number
              <input v-model="form.streetNumber" inputmode="numeric" />
            </label>

            <label>
              City
              <input v-model="form.city" />
            </label>

            <label>
              State
              <select v-model="form.state">
                <option value="" disabled>Select state</option>
                <option v-for="state in stateOptions" :key="state" :value="state">
                  {{ state }}
                </option>
              </select>
            </label>

            <label>
              Zip Code
              <input v-model="form.zipCode" inputmode="numeric" />
            </label>
          </div>

          <div class="actions">
            <button type="submit" class="primary" :disabled="loading">{{ submitLabel }}</button>
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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api'
import { useCustomerStore } from '@/stores/customers'
import type { Customer } from '@/types/mock'

type CustomerApiRecord = Customer & {
  _id?: string
}

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const stateOptions = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
]

const form = ref({
  name: '',
  phone: '',
  email: '',
  streetNumber: '',
  city: '',
  state: '',
  zipCode: '',
})

const route = useRoute()
const router = useRouter()
const customerStore = useCustomerStore()

const editCustomerId = computed(() => String(route.query.id || ''))
const isEditMode = computed(() => Boolean(editCustomerId.value))

const pageEyebrow = computed(() => (isEditMode.value ? 'Customer update' : 'Customer creation'))
const pageTitle = computed(() =>
  isEditMode.value ? 'Update Customer Profile' : 'Register New Customer',
)
const submitLabel = computed(() => (isEditMode.value ? 'Update Customer' : 'Create Customer'))

function parseAddress(address: string) {
  const raw = String(address || '').trim()
  if (!raw) {
    return { streetNumber: '', city: '', state: '', zipCode: '' }
  }

  const strictMatch = raw.match(/^([^,]+),\s*([^,]+),\s*([A-Za-z]{2})\s+([0-9]{5}(?:-[0-9]{4})?)$/)
  if (strictMatch) {
    return {
      streetNumber: strictMatch[1] ?? '',
      city: strictMatch[2] ?? '',
      state: String(strictMatch[3] ?? '').toUpperCase(),
      zipCode: strictMatch[4] ?? '',
    }
  }

  const parts = raw.split(',').map((part) => part.trim())
  const streetNumber = parts[0] ?? ''
  const city = parts[1] ?? ''
  const stateZip = parts[2] ?? ''
  const stateZipMatch = stateZip.match(/^([A-Za-z]{2})\s+([0-9]{5}(?:-[0-9]{4})?)$/)

  return {
    streetNumber,
    city,
    state: stateZipMatch ? String(stateZipMatch[1]).toUpperCase() : '',
    zipCode: stateZipMatch ? (stateZipMatch[2] ?? '') : '',
  }
}

function buildAddress() {
  return `${form.value.streetNumber.trim()}, ${form.value.city.trim()}, ${form.value.state.trim()} ${form.value.zipCode.trim()}`
}

async function hydrateForEdit() {
  if (!isEditMode.value) return

  await customerStore.fetchCustomers(true)
  const existing = customerStore.customerById(editCustomerId.value)

  if (!existing) {
    throw new Error('Customer not found')
  }

  form.value = {
    name: existing.name ?? '',
    phone: existing.phone ?? '',
    email: existing.email ?? '',
    ...parseAddress(existing.address ?? ''),
  }
}

async function submit() {
  loading.value = true
  error.value = null
  success.value = false
  const payload = {
    name: form.value.name,
    phone: form.value.phone,
    email: form.value.email,
    address: buildAddress(),
  }

  try {
    const saved = isEditMode.value
      ? await apiFetch<CustomerApiRecord>(
          `/updateCustomer/${encodeURIComponent(editCustomerId.value)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        )
      : await apiFetch<CustomerApiRecord>('/newCustomer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    customerStore.addCustomer(saved)

    const newId = String(saved.id ?? saved._id ?? '')
    if (!newId) {
      throw new Error('Customer saved, but no customer id was returned')
    }

    router.push({ name: 'CustomerProfile', query: { id: newId } })
    success.value = true
    if (!isEditMode.value) {
      form.value = {
        name: '',
        phone: '',
        email: '',
        streetNumber: '',
        city: '',
        state: '',
        zipCode: '',
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

onMounted(async () => {
  try {
    await hydrateForEdit()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
})
</script>

<style scoped>
.customer-registration-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.customer-registration-shell {
  width: min(100%, 920px);
  position: relative;
  margin-block: 0;
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
  margin-bottom: 0;
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
  min-height: 46px;
  font: inherit;
  background: #ffffff;
  color: #0f172a;
}

select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #64748b 50%),
    linear-gradient(135deg, #64748b 50%, transparent 50%);
  background-position:
    calc(100% - 16px) calc(50% - 2px),
    calc(100% - 11px) calc(50% - 2px);
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
  padding-right: 34px;
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
    margin-bottom: 12px;
  }
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
