<template>
  <div class="header-actions profile-action-group">
    <div class="ticket-badge profile-status-badge">{{ status }}</div>
    <button type="button" class="primary profile-action-btn" @click="$emit('open-conversation')">
      messages
    </button>
    <button
      v-if="!isTicketClosed"
      type="button"
      class="primary profile-action-btn"
      @click="$emit('edit-work')"
    >
      Update
    </button>
    <button
      v-if="!isTicketClosed"
      type="button"
      class="primary profile-action-btn"
      @click="$emit('close-ticket')"
    >
      Close Ticket
    </button>
    <button
      v-else
      type="button"
      class="primary profile-action-btn"
      :disabled="updatingTicketStatus"
      @click="$emit('reopen-ticket')"
    >
      Reopen Ticket
    </button>
    <button
      type="button"
      class="primary profile-action-btn"
      :disabled="generatingTicketPreview"
      @click="$emit('generate-preview')"
    >
      {{ isTicketClosed ? 'Final Invoice Preview' : 'Preview Update' }}
    </button>
    <span v-if="updatingTicketStatus">Updating status...</span>
    <span v-if="ticketStatusError" class="error">{{ ticketStatusError }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: string
  isTicketClosed: boolean
  updatingTicketStatus: boolean
  generatingTicketPreview: boolean
  ticketStatusError: string | null
}>()

defineEmits<{
  (event: 'open-conversation'): void
  (event: 'edit-work'): void
  (event: 'close-ticket'): void
  (event: 'reopen-ticket'): void
  (event: 'generate-preview'): void
}>()
</script>

<style scoped>
.error {
  color: #b91c1c;
}
</style>
