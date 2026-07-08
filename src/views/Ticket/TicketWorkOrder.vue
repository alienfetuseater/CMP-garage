<template>
  <div class="ticket-backdrop" @click.self="close">
    <section class="ticket-popup">
      <header class="ticket-header">
        <div>
          <h3>Ticket Work Order</h3>
          <p class="ticket-subtitle">{{ ticket.title }}</p>
        </div>
        <button class="close-btn" @click="close">✕</button>
      </header>

      <ul class="ticket-details">
        <li><strong>ID:</strong> {{ ticket.id }}</li>
        <li><strong>Status:</strong> {{ ticket.status }}</li>
        <li><strong>Priority:</strong> {{ ticket.priority }}</li>
        <li><strong>Scheduled Date:</strong> {{ ticket.scheduledDate }}</li>
        <li><strong>Customer ID:</strong> {{ ticket.customerId }}</li>
        <li><strong>Vessel ID:</strong> {{ ticket.vesselId }}</li>
        <li><strong>Notes:</strong> {{ ticket.notes }}</li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Ticket } from '@/types/mock'

export default defineComponent({
  props: {
    ticket: {
      type: Object as PropType<Ticket>,
      required: true,
    },
  },
  emits: ['close'],
  setup(_, { emit }) {
    function close() {
      emit('close')
    }

    return {
      close,
    }
  },
})
</script>

<style scoped>
.ticket-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.ticket-popup {
  width: min(90vw, 520px);
  max-height: 80vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.18);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.ticket-header h3 {
  margin: 0;
}

.ticket-subtitle {
  margin: 4px 0 0;
  color: #6b7280;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}

.ticket-details {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ticket-details li {
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.ticket-details li:last-child {
  border-bottom: none;
}

.ticket-details strong {
  display: inline-block;
  width: 125px;
  color: #111827;
}
</style>
