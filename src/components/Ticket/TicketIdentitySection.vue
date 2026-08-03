<template>
  <section class="ticket-identity-section">
    <div class="form-grid">
      <label>
        Customer Name
        <input
          :value="form.customerName"
          :disabled="isEditMode"
          :class="{ immutable: isEditMode }"
          @input="updateTextField('customerName', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label>
        Vessel Name
        <input
          :value="form.vesselName"
          :disabled="isEditMode"
          :class="{ immutable: isEditMode }"
          @input="updateTextField('vesselName', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label>
        Service Category
        <select
          :value="form.service_category"
          required
          @change="updateTextField('service_category', ($event.target as HTMLSelectElement).value)"
        >
          <option value="repair">repair</option>
          <option value="maintenance">maintenance</option>
          <option value="diagnosis">diagnosis</option>
        </select>
      </label>

      <label>
        Status
        <select
          :value="form.status"
          required
          @change="updateTextField('status', ($event.target as HTMLSelectElement).value)"
        >
          <option value="open">open</option>
          <option value="in progress">in progress</option>
          <option value="completed">completed</option>
          <option value="closed">closed</option>
          <option value="cancelled">cancelled</option>
          <option value="on hold">on hold</option>
        </select>
      </label>

      <label>
        Priority
        <select
          :value="form.priority"
          required
          @change="updateTextField('priority', ($event.target as HTMLSelectElement).value)"
        >
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </label>

      <label>
        Scheduled Date
        <input
          :value="form.scheduledDate"
          type="date"
          required
          @input="updateTextField('scheduledDate', ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>

    <label>
      Service Title
      <input
        :value="form.service_title"
        required
        @input="updateTextField('service_title', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <label v-if="!isEditMode">
      Notes
      <textarea
        :value="form.notes"
        rows="5"
        @input="updateTextField('notes', ($event.target as HTMLTextAreaElement).value)"
      />
    </label>

    <section v-else class="plan-section">
      <div class="section-heading">
        <h3>Notes History</h3>
        <p>Previous notes are read-only. Add a fresh update note below.</p>
      </div>

      <div v-if="existingNoteEntries.length" class="notes-stack">
        <div v-for="(entry, index) in existingNoteEntries" :key="index" class="immutable-notes">
          {{ entry }}
        </div>
      </div>
      <div v-else class="empty-state">No previous notes yet.</div>

      <label>
        New Update Note
        <textarea
          :value="newUpdateNote"
          rows="4"
          placeholder="Add a fresh update note for this work order"
          @input="emit('update:newUpdateNote', ($event.target as HTMLTextAreaElement).value)"
        />
      </label>
    </section>
  </section>
</template>

<script setup lang="ts">
import type { PlanActionItem, RequiredPartItem, TicketPhotoAttachment } from '@/types/mock'

interface TicketFormState {
  customerName: string
  vesselName: string
  customerId: string
  vesselId: string
  service_category: string
  service_title: string
  status: string
  priority: string
  scheduledDate: string
  notes: string
  initialAssessment: string
  initialAssessmentPhotos: TicketPhotoAttachment[]
  recommendedService: string
  summaryOfWorkPerformed: string
  summaryOfWorkPerformedPhotos: TicketPhotoAttachment[]
  laborCost: number
  summaryOfFurtherRecommendations: string
  planOfAction: PlanActionItem[]
  requiredParts: RequiredPartItem[]
}

const props = defineProps<{
  form: TicketFormState
  isEditMode: boolean
  existingNoteEntries: string[]
  newUpdateNote: string
}>()

const emit = defineEmits<{
  (event: 'update:newUpdateNote', value: string): void
}>()

type TextFieldName =
  | 'customerName'
  | 'vesselName'
  | 'service_category'
  | 'status'
  | 'priority'
  | 'scheduledDate'
  | 'service_title'
  | 'notes'

function updateTextField(field: TextFieldName, value: string) {
  props.form[field] = value
}
</script>

<style scoped>
.ticket-identity-section {
  display: grid;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.plan-section {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
}

.section-heading h3 {
  margin: 0;
  color: #0f172a;
}

.section-heading p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.immutable-notes {
  padding: 12px 14px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  white-space: pre-wrap;
}

.notes-stack {
  display: grid;
  gap: 10px;
}

.empty-state {
  color: #64748b;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #334155;
  font-weight: 600;
  min-width: 0;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  background: #ffffff;
  color: #0f172a;
}

.immutable {
  background: #f1f5f9;
  color: #64748b;
}

textarea {
  resize: vertical;
}

:global(body.theme-dark) .ticket-identity-section {
  background: transparent;
  border-color: rgba(98, 114, 164, 0.28);
  color: #f8f8f2;
}

:global(body.theme-dark) .ticket-identity-section .section-heading h3,
:global(body.theme-dark) .ticket-identity-section .section-heading p,
:global(body.theme-dark) .ticket-identity-section label,
:global(body.theme-dark) .ticket-identity-section .immutable-notes {
  color: #f8f8f2;
}

:global(body.theme-dark) .ticket-identity-section input,
:global(body.theme-dark) .ticket-identity-section select,
:global(body.theme-dark) .ticket-identity-section textarea {
  background: #282a36;
  border-color: #6272a4;
  color: #f8f8f2;
}

:global(body.theme-dark) .ticket-identity-section .plan-section,
:global(body.theme-dark) .ticket-identity-section .immutable-notes {
  background: #282a36;
  border-color: #6272a4;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
