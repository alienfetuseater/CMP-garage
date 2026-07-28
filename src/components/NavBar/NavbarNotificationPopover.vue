<template>
  <div class="notifications-popup">
    <div class="notifications-head">
      <strong class="notifications-title">{{ title }}</strong>
      <div class="notifications-actions">
        <span v-if="count !== null" class="notifications-total">{{ count }}</span>
        <button
          type="button"
          class="popup-close-btn"
          :aria-label="closeLabel"
          @click="emit('close')"
        >
          X
        </button>
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  count?: string | number | null
  closeLabel: string
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()
</script>

<style scoped>
.notifications-popup {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: min(94vw, 320px);
  max-height: min(70vh, 520px);
  overflow: auto;
  padding: 0.8rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
  z-index: 240;
}

.notifications-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.7rem;
}

.notifications-title {
  color: #0f172a;
  font-size: 0.95rem;
}

.notifications-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notifications-total {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.8rem;
  font-weight: 700;
}

.popup-close-btn {
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 0.95rem;
}
</style>
