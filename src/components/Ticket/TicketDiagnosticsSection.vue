<template>
  <section class="diagnostics-section">
    <div class="section-heading profile-section-heading diagnostics-heading">
      <div>
        <h3>Diagnostics</h3>
        <p>{{ description }}</p>
      </div>

      <fieldset v-if="!embedded" class="diagnostics-toggle">
        <legend>Show diagnostics form</legend>
        <label>
          <input
            type="radio"
            :checked="!showDiagnostics"
            @change="$emit('update:showDiagnostics', false)"
          />
          Hide
        </label>
        <label>
          <input
            type="radio"
            :checked="showDiagnostics"
            @change="$emit('update:showDiagnostics', true)"
          />
          Show
        </label>
      </fieldset>
    </div>

    <div v-if="showDiagnostics" class="diagnostics-form">
      <div v-for="section in diagnosticSections" :key="section.title" class="diagnostic-group">
        <div class="diagnostic-group-header">
          <h4>{{ section.title }}</h4>
        </div>

        <div class="diagnostics-grid">
          <label v-for="field in section.fields" :key="field.key">
            {{ field.label }}
            <select
              :value="diagnostics[field.key]"
              :disabled="readonly"
              @change="
                $emit('update-diagnostic', {
                  key: field.key,
                  value: ($event.target as HTMLSelectElement).value as DiagnosticLevel,
                })
              "
            >
              <option value="good">good</option>
              <option value="monitor">monitor</option>
              <option value="action">action</option>
              <option value="N/A">N/A</option>
            </select>
          </label>
        </div>
      </div>

      <div v-if="!embedded" class="diagnostics-footer">
        <button
          type="button"
          class="primary diagnostics-save"
          :disabled="savingDiagnostics"
          @click="$emit('save')"
        >
          Save Diagnostics
        </button>
        <span v-if="savingDiagnostics">Saving...</span>
        <span v-if="diagnosticsSuccess" class="success">Saved</span>
        <span v-if="diagnosticsError" class="error">{{ diagnosticsError }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DiagnosticLevel } from '@/types/mock'

type DiagnosticField = {
  key: string
  label: string
}

type DiagnosticSection = {
  title: string
  fields: ReadonlyArray<DiagnosticField>
}

withDefaults(
  defineProps<{
    diagnosticSections: ReadonlyArray<DiagnosticSection>
    diagnostics: Record<string, DiagnosticLevel>
    showDiagnostics: boolean
    savingDiagnostics?: boolean
    diagnosticsSuccess?: boolean
    diagnosticsError?: string | null
    embedded?: boolean
    readonly?: boolean
    description?: string
  }>(),
  {
    savingDiagnostics: false,
    diagnosticsSuccess: false,
    diagnosticsError: null,
    embedded: false,
    readonly: false,
    description: 'Fill out the inspection details here after the ticket has been created.',
  },
)

defineEmits<{
  (event: 'update:showDiagnostics', value: boolean): void
  (event: 'update-diagnostic', payload: { key: string; value: DiagnosticLevel }): void
  (event: 'save'): void
}>()
</script>

<style scoped>
.diagnostics-section {
  margin-top: 24px;
  display: grid;
  gap: 18px;
}

.section-heading h3 {
  margin: 0 0 12px;
  color: #0f172a;
}

.diagnostics-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.diagnostics-heading p {
  margin: 4px 0 0;
  color: #64748b;
}

.diagnostics-toggle {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  padding: 10px 12px;
  background: #f8fbff;
}

.diagnostics-toggle legend {
  padding: 0 4px;
  font-weight: 700;
  color: #0f172a;
}

.diagnostics-toggle label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #334155;
}

.diagnostics-form {
  display: grid;
  gap: 18px;
}

.diagnostic-group {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
}

.diagnostic-group-header h4 {
  margin: 0;
  color: #0f172a;
}

.diagnostics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.diagnostics-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.diagnostics-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  padding-top: 4px;
}

.diagnostics-save {
  white-space: nowrap;
}

.error {
  color: #b91c1c;
}

.success {
  color: #059669;
}

@media (max-width: 720px) {
  .diagnostics-heading {
    flex-direction: column;
  }

  .diagnostics-toggle {
    width: 100%;
  }

  .diagnostics-footer {
    justify-content: flex-start;
  }

  .diagnostics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
