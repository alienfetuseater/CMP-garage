<template>
  <div class="identity-section">
    <div class="form-grid">
      <label>
        Vessel Name
        <input
          :value="modelValue.vesselName"
          required
          @input="updateField('vesselName', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label>
        Make
        <select
          :value="modelValue.vesselMakeSelection"
          @change="updateField('vesselMakeSelection', ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>Select make</option>
          <option v-for="make in popularBoatMakes" :key="make" :value="make">
            {{ make }}
          </option>
          <option value="other">Other</option>
        </select>
      </label>

      <label v-if="modelValue.vesselMakeSelection === 'other'">
        Other Make
        <input
          :value="modelValue.vesselMakeOther"
          required
          placeholder="Enter vessel make"
          @input="updateField('vesselMakeOther', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label>
        Year
        <input
          :value="modelValue.vesselYear ?? ''"
          type="number"
          @input="updateNumberField('vesselYear', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label>
        Hull ID Number
        <input
          :value="modelValue.hullIdNumber"
          @input="updateField('hullIdNumber', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label>
        Number of Engines
        <input
          :value="modelValue.numberOfEngines ?? ''"
          type="number"
          min="0"
          @input="updateNumberField('numberOfEngines', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label v-if="modelValue.numberOfEngines && modelValue.numberOfEngines > 0">
        Engine Fuel Type
        <select
          :value="modelValue.engineFuelType"
          required
          @change="
            updateField(
              'engineFuelType',
              ($event.target as HTMLSelectElement).value as Form['engineFuelType'],
            )
          "
        >
          <option value="" disabled>Select fuel type</option>
          <option value="gasoline">Gasoline</option>
          <option value="diesel">Diesel</option>
        </select>
      </label>

      <label v-if="modelValue.numberOfEngines && modelValue.numberOfEngines > 0">
        Engine Installation
        <select
          :value="modelValue.engineInstallationType"
          required
          @change="
            updateField(
              'engineInstallationType',
              ($event.target as HTMLSelectElement).value as Form['engineInstallationType'],
            )
          "
        >
          <option value="" disabled>Select installation</option>
          <option value="inboard">Inboard</option>
          <option value="outboard">Outboard</option>
        </select>
      </label>

      <label>
        Generator
        <select
          :value="modelValue.generator"
          @change="
            updateField('generator', ($event.target as HTMLSelectElement).value as 'yes' | 'no')
          "
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </label>

      <label v-if="modelValue.generator === 'yes'">
        Number of Generators
        <input
          :value="modelValue.generatorCount ?? 1"
          type="number"
          min="1"
          required
          @input="updateNumberField('generatorCount', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label>
        Boat Location
        <select
          :value="modelValue.boatLocation"
          @change="
            updateField(
              'boatLocation',
              ($event.target as HTMLSelectElement).value as 'trailor' | 'slip' | 'dry dock' | '',
            )
          "
        >
          <option value="" disabled>Select location</option>
          <option value="trailor">trailor</option>
          <option value="slip">slip</option>
          <option value="dry dock">dry dock</option>
        </select>
      </label>

      <label>
        Engine Make
        <select
          :value="modelValue.engineMakeSelection"
          @change="updateField('engineMakeSelection', ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>Select engine make</option>
          <option v-for="make in popularEngineMakes" :key="make" :value="make">
            {{ make }}
          </option>
          <option value="other">Other</option>
        </select>
      </label>

      <label v-if="modelValue.engineMakeSelection === 'other'">
        Other Engine Make
        <input
          :value="modelValue.engineMakeOther"
          required
          placeholder="Enter engine manufacturer"
          @input="updateField('engineMakeOther', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label>
        Engine Model
        <input
          :value="modelValue.engineModel"
          @input="updateField('engineModel', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label>
        Engine Horsepower
        <input
          :value="modelValue.engineHorsepower ?? ''"
          type="number"
          min="0"
          step="1"
          @input="updateNumberField('engineHorsepower', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label>
        Engine Hours
        <input
          :value="modelValue.engineHours ?? ''"
          type="number"
          min="0"
          step="1"
          @input="updateNumberField('engineHours', ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>

    <fieldset
      class="engine-serials"
      v-if="modelValue.numberOfEngines && modelValue.numberOfEngines > 0"
    >
      <legend>Engine Serial Numbers</legend>
      <div
        v-for="(serial, index) in modelValue.engineSerialNumbers"
        :key="index"
        class="engine-serial-row"
      >
        <label>
          Engine {{ index + 1 }} Serial Number
          <input
            :value="serial"
            :disabled="serial === 'Not Available'"
            placeholder="Enter serial number"
            @input="updateSerial(index, ($event.target as HTMLInputElement).value)"
          />
        </label>
        <button type="button" class="na-toggle" @click="toggleSerialNotAvailable(index)">
          {{ serial === 'Not Available' ? 'Use serial' : 'Mark N/A' }}
        </button>
      </div>
    </fieldset>
    <p v-else class="hint">Add the number of engines above to enter serial numbers.</p>

    <fieldset class="engine-serials" v-if="modelValue.generator === 'yes'">
      <legend>Generator Serial Numbers</legend>
      <div
        v-for="(serial, index) in modelValue.generatorSerialNumbers"
        :key="index"
        class="engine-serial-row"
      >
        <label>
          Generator {{ index + 1 }} Serial Number
          <input
            :value="serial"
            :disabled="serial === 'Not Available'"
            placeholder="Enter serial number"
            @input="updateGeneratorSerial(index, ($event.target as HTMLInputElement).value)"
          />
        </label>
        <button type="button" class="na-toggle" @click="toggleGeneratorSerialNotAvailable(index)">
          {{ serial === 'Not Available' ? 'Use serial' : 'Mark N/A' }}
        </button>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
interface Form {
  customerId: string
  vesselName: string
  vesselMakeSelection: string
  vesselMakeOther: string
  vesselYear: number | null
  hullIdNumber: string
  numberOfEngines: number | null
  engineSerialNumbers: string[]
  engineFuelType: 'gasoline' | 'diesel' | ''
  engineInstallationType: 'inboard' | 'outboard' | ''
  generator: 'yes' | 'no'
  generatorCount: number | null
  generatorSerialNumbers: string[]
  boatLocation: 'trailor' | 'slip' | 'dry dock' | ''
  engineMakeSelection: string
  engineMakeOther: string
  engineModel: string
  engineHorsepower: number | null
  engineHours: number | null
  boatPhotoDataUrl: string
}

const props = defineProps<{
  modelValue: Form
  popularBoatMakes: readonly string[]
  popularEngineMakes: readonly string[]
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: Form): void
}>()

function emitUpdate(next: Form) {
  emit('update:modelValue', next)
}

function updateField<K extends keyof Form>(field: K, value: Form[K]) {
  emitUpdate({ ...props.modelValue, [field]: value })
}

function updateNumberField(
  field: 'vesselYear' | 'numberOfEngines' | 'generatorCount' | 'engineHorsepower' | 'engineHours',
  value: string,
) {
  const parsed = value === '' ? null : Number(value)
  updateField(field, parsed as Form[typeof field])
}

function updateGeneratorSerial(index: number, value: string) {
  const nextSerials = [...props.modelValue.generatorSerialNumbers]
  nextSerials[index] = value
  emitUpdate({ ...props.modelValue, generatorSerialNumbers: nextSerials })
}

function toggleGeneratorSerialNotAvailable(index: number) {
  const nextSerials = [...props.modelValue.generatorSerialNumbers]
  const current = nextSerials[index] || ''
  nextSerials[index] = current === 'Not Available' ? '' : 'Not Available'
  emitUpdate({ ...props.modelValue, generatorSerialNumbers: nextSerials })
}

function updateSerial(index: number, value: string) {
  const nextSerials = [...props.modelValue.engineSerialNumbers]
  nextSerials[index] = value
  emitUpdate({ ...props.modelValue, engineSerialNumbers: nextSerials })
}

function toggleSerialNotAvailable(index: number) {
  const nextSerials = [...props.modelValue.engineSerialNumbers]
  const current = nextSerials[index] || ''
  nextSerials[index] = current === 'Not Available' ? '' : 'Not Available'
  emitUpdate({ ...props.modelValue, engineSerialNumbers: nextSerials })
}
</script>

<style scoped>
.identity-section {
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

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .engine-serial-row {
    grid-template-columns: 1fr;
  }
}
</style>
