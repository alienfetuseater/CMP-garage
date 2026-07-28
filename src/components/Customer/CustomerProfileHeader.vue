<template>
  <header class="profile-header">
    <div>
      <p class="eyebrow">Customer profile</p>
      <h2>{{ customerName }}</h2>
    </div>

    <div class="header-actions profile-action-group">
      <button type="button" class="primary profile-action-btn" @click="$emit('update-profile')">
        Update Customer Profile
      </button>
      <button type="button" class="primary profile-action-btn" @click="$emit('add-vessel')">
        Add New Vessel
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  customerName: string
}>()

defineEmits<{
  (event: 'update-profile'): void
  (event: 'add-vessel'): void
}>()
</script>

<style scoped>
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
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

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.profile-action-group {
  align-items: center;
}

.profile-action-btn {
  border: 1px solid var(--color-ocean-deep);
  background: var(--color-ocean-dark);
  color: #ffffff;
  border-radius: 999px;
  min-height: 42px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .profile-header {
    flex-direction: column;
  }
}
</style>
