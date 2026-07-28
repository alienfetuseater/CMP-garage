<template>
  <section class="composer-section">
    <div class="section-heading">
      <h3>New Internal Message</h3>
    </div>

    <label>
      Message
      <textarea
        :value="draftMessage"
        rows="6"
        placeholder="Write an internal message about this ticket or reminder"
        @input="emit('update:draft-message', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </label>

    <div class="actions">
      <button
        type="button"
        class="primary"
        :disabled="sending || !draftMessage.trim()"
        @click="emit('send-message')"
      >
        Send Message
      </button>
      <span v-if="sending">Sending...</span>
      <span v-if="success" class="success">{{ success }}</span>
      <span v-if="sendError" class="error">{{ sendError }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  draftMessage: string
  sending: boolean
  success: string | null
  sendError: string | null
}>()

const emit = defineEmits<{
  (event: 'update:draft-message', value: string): void
  (event: 'send-message'): void
}>()
</script>

<style scoped>
.composer-section {
  display: grid;
  gap: 12px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.section-heading h3 {
  margin: 0;
  color: #0f172a;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #334155;
  font-weight: 600;
}

textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  resize: vertical;
  font: inherit;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.primary {
  border: none;
  background: var(--color-ocean-dark);
  color: #fff;
  border-radius: 999px;
  padding: 0.75rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success {
  color: #15803d;
}

.error {
  color: #b91c1c;
}
</style>
