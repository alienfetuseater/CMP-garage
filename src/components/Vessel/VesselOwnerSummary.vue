<template>
  <div class="owner-strip">
    <div class="owner-card clickable" @click="$emit('open-owner')">
      <div class="owner-field">
        <span class="owner-field-label">Name:</span>
        <span class="owner-field-value">{{ ownerName }}</span>
      </div>

      <div class="owner-field">
        <span class="owner-field-label">Phone:</span>
        <span class="owner-field-value">{{ ownerPhone }}</span>
      </div>

      <div class="owner-field">
        <span class="owner-field-label">Address:</span>
        <span class="owner-field-value">{{ ownerAddress }}</span>
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
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 14px;
  background: #eff6ff;
  color: #0f172a;
  margin-bottom: 20px;
}

.owner-card {
  display: grid;
  gap: 10px;
  width: 100%;
}

.owner-field {
  display: flex;
  align-items: baseline;
  gap: 10px;
  width: 100%;
}

.owner-field-label {
  font-size: 0.95rem;
  color: #475569;
  font-weight: 700;
  min-width: 72px;
}

.owner-field-value {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 600;
  flex: 1;
}

.clickable {
  cursor: pointer;
}
</style>
