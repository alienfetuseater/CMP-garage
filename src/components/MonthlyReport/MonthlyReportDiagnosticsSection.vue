<template>
  <section class="diagnostics-section">
    <div class="section-heading">
      <h3>Diagnostics</h3>
      <p>{{ description }}</p>
    </div>

    <div class="diagnostics-form">
      <section v-for="section in diagnosticSections" :key="section.title" class="diagnostic-group">
        <h4>{{ section.title }}</h4>
        <div class="diagnostics-grid">
          <MonthlyReportDiagnosticField
            v-for="field in section.fields"
            :key="field.key"
            :label="field.label"
            :entry="diagnosticEntry(field.key)"
            :readonly="readonly"
            @error="$emit('error', $event)"
            @update-entry="$emit('update-diagnostic', { key: field.key, entry: $event })"
          />
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import MonthlyReportDiagnosticField from './MonthlyReportDiagnosticField.vue'
import type { MonthlyReportDiagnosticEntry, MonthlyReportDiagnostics } from '@/types/mock'

type DiagnosticSection = {
  title: string
  fields: ReadonlyArray<{ key: string; label: string }>
}

const props = withDefaults(
  defineProps<{
    diagnosticSections: ReadonlyArray<DiagnosticSection>
    diagnostics: MonthlyReportDiagnostics
    readonly?: boolean
    description?: string
  }>(),
  {
    readonly: false,
    description: 'Complete the vessel inspection details for this monthly report.',
  },
)

defineEmits<{
  (event: 'error', message: string): void
  (event: 'update-diagnostic', payload: { key: string; entry: MonthlyReportDiagnosticEntry }): void
}>()

function diagnosticEntry(key: string): MonthlyReportDiagnosticEntry {
  return props.diagnostics[key] as MonthlyReportDiagnosticEntry
}
</script>

<style scoped>
.diagnostics-section,
.diagnostics-form,
.diagnostic-group {
  display: grid;
  gap: 16px;
}

.diagnostics-section {
  margin-top: 24px;
}

.section-heading h3,
.diagnostic-group h4 {
  margin: 0;
  color: #0f172a;
}

.section-heading p {
  margin: 4px 0 0;
  color: #64748b;
}

.diagnostic-group {
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
}

.diagnostics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 720px) {
  .diagnostics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
