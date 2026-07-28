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
import type { Vessel } from '@/types/mock'

defineProps<{
  vessel: Vessel
  photoPreviewUrl: string | null
}>()
</script>

<style scoped>
.details-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
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
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
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
