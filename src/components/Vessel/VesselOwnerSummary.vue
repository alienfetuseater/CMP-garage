<template>
  <div class="owner-strip">
    <div class="owner-card clickable" @click="$emit('open-owner')">
      <div class="owner-card-header">
        <div>
          <p class="eyebrow">Owner profile</p>
          <h3>{{ ownerName }}</h3>
        </div>
        <button type="button" class="owner-link">Open profile</button>
      </div>

      <div class="owner-grid">
        <div class="owner-field">
          <span class="owner-field-label">Phone</span>
          <span class="owner-field-value">{{ ownerPhone || 'No phone provided' }}</span>
        </div>

        <div class="owner-field">
          <span class="owner-field-label">Address</span>
          <span class="owner-field-value">{{ ownerAddress || 'No address available' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  ownerName: string
  ownerPhone: string
  ownerAddress: string
}>()

defineEmits<{
  (event: 'open-owner'): void
}>()
</script>

<style scoped>
.owner-strip {
  margin-bottom: 20px;
}

.owner-card {
  border: 1px solid #44475a;
  border-radius: 10px;
  background: #313447;
  padding: 18px 20px;
  box-shadow: none;
}

.owner-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.eyebrow {
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  color: #a7adce;
  font-weight: 700;
}

.owner-card h3 {
  margin: 0;
  color: #f8f8f2;
  font-size: 1.05rem;
}

.owner-link {
  border: 1px solid #6272a4;
  background: #44475a;
  color: #f8f8f2;
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
}

.owner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.owner-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid #44475a;
  border-radius: 8px;
  background: #3a3f52;
  box-shadow: none;
}

.owner-field-label {
  font-size: 0.8rem;
  color: #a7adce;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
}

.owner-field-value {
  font-size: 0.98rem;
  color: #f8f8f2;
  font-weight: 600;
}

.clickable {
  cursor: pointer;
}
</style>
