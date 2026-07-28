<template>
  <section class="vessel-section">
    <div class="section-header">
      <h3>Vessels</h3>
      <span class="section-muted">{{ vesselCount }} registered</span>
    </div>

    <div v-if="vessels.length" class="vessel-grid">
      <article v-for="vessel in vessels" :key="vessel.id" class="vessel-card">
        <div class="vessel-card__top">
          <h4>{{ vessel.name }}</h4>
          <p class="vessel-meta">{{ vessel.type || 'Unspecified model' }} • {{ vessel.year || '—' }}</p>
        </div>

        <dl class="vessel-details">
          <div>
            <dt>Registration</dt>
            <dd>{{ vessel.registrationNumber || '—' }}</dd>
          </div>
          <div>
            <dt>Length</dt>
            <dd>{{ vessel.length || '—' }}</dd>
          </div>
          <div>
            <dt>Home Port</dt>
            <dd>{{ vessel.homePort || '—' }}</dd>
          </div>
        </dl>

        <div class="card-actions">
          <button type="button" class="secondary-action" @click="$emit('view-vessel', vessel.id)">
            View vessel
          </button>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <p>No vessels have been added yet.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface VesselSummary {
  id: string
  name: string
  type?: string
  year?: string | number
  registrationNumber?: string
  length?: string
  homePort?: string
}

const props = defineProps<{
  vessels: VesselSummary[]
}>()

const vesselCount = computed(() => props.vessels.length)

defineEmits<{
  (event: 'view-vessel', vesselId: string): void
}>()
</script>

<style scoped>
.vessel-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.section-muted {
  color: #64748b;
  font-size: 0.95rem;
}

.vessel-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

.vessel-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vessel-card__top h4 {
  margin: 0 0 6px;
}

.vessel-meta {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.vessel-details {
  display: grid;
  gap: 10px;
  margin: 0;
}

.vessel-details div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.vessel-details dt {
  color: #64748b;
  font-size: 0.9rem;
}

.vessel-details dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
}

.card-actions {
  margin-top: auto;
}

.secondary-action {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  padding: 0.6rem 0.8rem;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.empty-state {
  padding: 20px 0;
  text-align: center;
  color: #64748b;
}
</style>
