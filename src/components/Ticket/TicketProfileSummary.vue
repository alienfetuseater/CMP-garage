<template>
  <section class="summary-card">
    <div class="summary-header">
      <div>
        <p class="summary-eyebrow">Linked profiles</p>
        <h3>Customer & vessel overview</h3>
      </div>
    </div>

    <div class="profile-links">
      <button type="button" class="link-pill" @click="$emit('open-customer')">
        Customer: {{ customerName || 'Unknown customer' }}
      </button>
      <button type="button" class="link-pill" @click="$emit('open-vessel')">
        Vessel: {{ vesselName || 'Unknown vessel' }}
      </button>
    </div>

    <ul class="details">
      <li><strong>Status</strong> {{ ticket.status }}</li>
      <li><strong>Priority</strong> {{ ticket.priority }}</li>
      <li><strong>Assigned Technician</strong> {{ ticket.assignedUserName || 'Unassigned' }}</li>
      <li><strong>Created</strong> {{ formatDate(ticket.createdAt) }}</li>
      <li><strong>Scheduled</strong> {{ formatDate(ticket.scheduledDate) }}</li>
    </ul>
  </section>
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
.summary-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  padding: 20px;
  margin-bottom: 18px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-eyebrow {
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  color: #64748b;
  font-weight: 700;
}

.summary-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
}

.profile-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  margin-bottom: 14px;
}

.link-pill {
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
}

.details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.details li {
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
}

.details strong {
  display: block;
  margin-bottom: 4px;
  color: #475569;
}

:global(body.theme-dark) .summary-card {
  background: #313447;
  border-color: #44475a;
  color: #f8f8f2;
  box-shadow: none;
}

:global(body.theme-dark) .summary-card .summary-eyebrow,
:global(body.theme-dark) .summary-card .summary-header h3,
:global(body.theme-dark) .summary-card .details strong {
  color: #f8f8f2;
}

:global(body.theme-dark) .summary-card .link-pill,
:global(body.theme-dark) .summary-card .details li {
  background: #3a3f52;
  border-color: #44475a;
  color: #f8f8f2;
}
</style>
