<template>
  <header class="profile-header">
    <div>
      <p class="eyebrow">Vessel profile</p>
      <h2>{{ vesselName }}</h2>
    </div>

    <div v-if="canManage" class="header-actions profile-action-group">
      <button type="button" class="primary profile-action-btn" @click="$emit('edit')">
        Edit Vessel
      </button>
      <button type="button" class="primary profile-action-btn" @click="$emit('new-ticket')">
        New Ticket
      </button>
      <button
        type="button"
        class="primary profile-action-btn"
        :disabled="generatingDossier"
        @click="$emit('generate-dossier')"
      >
        Generate Dossier
      </button>
      <button type="button" class="primary profile-action-btn" @click="$emit('new-monthly-report')">
        New Monthly Report
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  vesselName: string
  generatingDossier: boolean
  canManage: boolean
}>()

defineEmits<{
  (event: 'edit'): void
  (event: 'new-ticket'): void
  (event: 'generate-dossier'): void
  (event: 'new-monthly-report'): void
}>()
</script>

<style scoped>
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
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

.profile-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1100px) {
  .profile-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
