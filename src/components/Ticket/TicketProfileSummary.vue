<template>
  <div class="owner-strip">
    <span class="owner-label">Customer</span>
    <button type="button" class="clickable owner owner-link" @click="$emit('open-customer')">
      {{ customerName }}
    </button>
    <span class="owner-divider">•</span>
    <span class="owner-label">Vessel</span>
    <button type="button" class="clickable owner owner-link" @click="$emit('open-vessel')">
      {{ vesselName }}
    </button>
  </div>

  <ul class="details">
    <li><strong>Status</strong> {{ ticket.status }}</li>
    <li><strong>Priority</strong> {{ ticket.priority }}</li>
    <li><strong>Assigned Technician</strong> {{ ticket.assignedUserName || 'Unassigned' }}</li>
    <li><strong>Created</strong> {{ formatDate(ticket.createdAt) }}</li>
    <li><strong>Scheduled</strong> {{ formatDate(ticket.scheduledDate) }}</li>
  </ul>
</template>

<script setup lang="ts">
import type { Ticket } from '@/types/mock'
import { formatLocalDateTime } from '@/shared/datetime/format'

defineProps<{
  ticket: Ticket
  customerName: string | null
  vesselName: string | null
}>()

defineEmits<{
  (event: 'open-customer'): void
  (event: 'open-vessel'): void
}>()

function formatDate(value?: string) {
  return formatLocalDateTime(value)
}
</script>

<style scoped>
.owner-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 14px;
  background: #eff6ff;
  color: #0f172a;
  margin-bottom: 18px;
}

.owner-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1d4ed8;
  font-weight: 700;
}

.owner-divider {
  color: #64748b;
}

.owner-link {
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  color: #2563eb;
  cursor: pointer;
  text-decoration: underline;
}

.details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0 0 18px;
}

.details li {
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f172a;
}

.details strong {
  display: block;
  margin-bottom: 4px;
  color: #475569;
}
</style>
