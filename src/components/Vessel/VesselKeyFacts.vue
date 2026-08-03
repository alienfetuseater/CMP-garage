<template>
  <section class="details-card">
    <div class="card-header">
      <h3>Vessel details</h3>
      <span class="subtitle">At a glance</span>
    </div>

    <div class="details-grid">
      <div class="detail-item">
        <span class="detail-label">Name</span>
        <span class="detail-value">{{ vessel.vesselName }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Make</span>
        <span class="detail-value">{{ vessel.vesselMake || '—' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Year</span>
        <span class="detail-value">{{ vessel.vesselYear || '—' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Location</span>
        <span class="detail-value">{{ vessel.boatLocation || '—' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Hull ID</span>
        <span class="detail-value">{{ vessel.hullIdNumber || '—' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Status</span>
        <span class="detail-value">Active</span>
      </div>
    </div>

    <section class="machinery-section">
      <div class="machinery-heading">
        <h4>Machinery</h4>
        <span
          >{{ vessel.numberOfEngines }} engine{{ vessel.numberOfEngines === 1 ? '' : 's' }}</span
        >
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">Engine</span>
          <span class="detail-value">{{ engineDescription }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Fuel / Installation</span>
          <span class="detail-value">{{ engineConfiguration }}</span>
        </div>
        <div class="detail-item detail-item-wide">
          <span class="detail-label">Engine Serial Numbers</span>
          <span class="detail-value">{{ serialNumberList(vessel.engineSerialNumbers) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Generators</span>
          <span class="detail-value">{{ generatorDescription }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Generator Serial Numbers</span>
          <span class="detail-value">{{ serialNumberList(vessel.generatorSerialNumbers) }}</span>
        </div>
      </div>
    </section>

    <div class="photo-card">
      <div v-if="photoPreviewUrl" class="photo-preview">
        <img :src="photoPreviewUrl" :alt="`${vessel.vesselName} photo`" />
      </div>
      <div v-else class="photo-placeholder">
        <span>No photo available</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Vessel } from '@/types/mock'

const props = defineProps<{
  vessel: Vessel
  photoPreviewUrl: string | null
}>()

const titleCase = (value?: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : ''

const serialNumberList = (serials?: string[]) =>
  serials?.filter((serial) => String(serial).trim()).join(', ') || 'Not available'

const engineDescription = computed(() => {
  const details = [props.vessel.engineMake, props.vessel.engineModel].filter(Boolean).join(' ')
  return details || 'Not available'
})

const engineConfiguration = computed(() => {
  const details = [
    titleCase(props.vessel.engineFuelType),
    titleCase(props.vessel.engineInstallationType),
  ].filter(Boolean)
  return details.join(' / ') || 'Not available'
})

const generatorDescription = computed(() => {
  if (!props.vessel.generator) return 'None'
  const count = Math.max(1, props.vessel.generatorCount ?? 1)
  return `${count} generator${count === 1 ? '' : 's'}`
})
</script>

<style scoped>
.details-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 18px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.card-header h3 {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
}

.detail-label {
  color: #64748b;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-value {
  color: #0f172a;
  font-weight: 700;
  font-size: 0.95rem;
}

.machinery-section {
  display: grid;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.machinery-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.machinery-heading h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
}

.machinery-heading span {
  color: #64748b;
  font-size: 0.9rem;
}

.detail-item-wide {
  grid-column: 1 / -1;
}

.photo-card {
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-placeholder {
  color: #64748b;
  font-weight: 600;
}

@media (max-width: 900px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
