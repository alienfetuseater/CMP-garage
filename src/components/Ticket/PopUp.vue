<template>
  <div class="ticket-backdrop" @click.self="close">
    <section class="ticket-popup">
      <header class="ticket-header">
        <div>
          <h3 class="clickable" @click="openTicket">Ticket Work Order</h3>
          <p class="ticket-subtitle clickable" @click="openTicket">{{ ticket.service_title }}</p>
        </div>
        <button class="close-btn" @click="close">✕</button>
      </header>

      <ul class="ticket-details clickable" @click="openTicket">
        <li><strong>Status:</strong> {{ ticket.status }}</li>
        <li><strong>Priority:</strong> {{ ticket.priority }}</li>
        <li><strong>Scheduled Date:</strong> {{ ticket.scheduledDate }}</li>
        <li><strong>Customer name:</strong> {{ ticket.customerId }}</li>
        <li><strong>Vessel name:</strong> {{ ticket.vesselId }}</li>
        <li><strong>Notes:</strong> {{ ticket.notes }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Ticket } from '@/types/mock'

const props = defineProps<{
  ticket: Ticket
}>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
function close() {
  emit('close')
}

function openTicket() {
  const tid = String(
    (props.ticket as Ticket & { _id?: string })?.id ??
      (props.ticket as Ticket & { _id?: string })?._id ??
      '',
  )
  if (tid) {
    router.push({ name: 'Ticket', query: { id: tid } })
    emit('close')
  }
}
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
