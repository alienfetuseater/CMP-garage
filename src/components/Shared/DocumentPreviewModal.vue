<template>
  <div v-if="modelValue" class="preview-backdrop" @click.self="closeModal">
    <section class="preview-modal" role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <header class="preview-header">
        <div>
          <p class="eyebrow">{{ eyebrow }}</p>
          <h3 :id="titleId">{{ heading }}</h3>
        </div>
        <button
          type="button"
          class="close-preview"
          :disabled="busy"
          @click="closeModal"
          aria-label="Close preview"
        >
          ✕
        </button>
      </header>

      <div class="preview-frame-wrap">
        <div v-if="loading && !previewUrl" class="preview-loading">Loading preview...</div>
        <iframe
          v-else-if="previewUrl"
          ref="previewFrameRef"
          class="preview-frame"
          :src="previewUrl"
          :title="iframeTitle"
        ></iframe>
      </div>

      <div class="preview-actions">
        <button
          v-if="showPrintButton"
          type="button"
          class="preview-action-button"
          :disabled="busy"
          @click="printPreview"
        >
          Print
        </button>
        <button
          v-if="showSaveButton"
          type="button"
          class="preview-action-button"
          :disabled="busy"
          @click="$emit('save')"
        >
          Save
        </button>
        <button
          v-if="showEmailButton"
          type="button"
          class="preview-action-button"
          :disabled="busy"
          @click="$emit('email')"
        >
          Email
        </button>
        <button
          type="button"
          class="preview-action-button preview-cancel-button"
          :disabled="busy"
          @click="closeModal"
          aria-label="Cancel preview"
        >
          ✕
        </button>
        <span v-if="busy">Working...</span>
        <span v-if="success" class="success">{{ success }}</span>
        <span v-if="error" class="error">{{ error }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    modelValue: boolean
    eyebrow: string
    heading: string
    previewUrl: string | null
    loading: boolean
    busy: boolean
    success: string | null
    error: string | null
    iframeTitle: string
    titleId?: string
    showPrintButton?: boolean
    showSaveButton?: boolean
    showEmailButton?: boolean
  }>(),
  {
    titleId: 'document-preview-title',
    showPrintButton: true,
    showSaveButton: false,
    showEmailButton: false,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'save'): void
  (event: 'email'): void
}>()

const previewFrameRef = ref<HTMLIFrameElement | null>(null)

function closeModal() {
  emit('update:modelValue', false)
}

function printPreview() {
  previewFrameRef.value?.contentWindow?.print()
}
</script>

<style scoped>
.preview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 60;
}

.preview-modal {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 2;
  pointer-events: none;
}

.preview-header > * {
  pointer-events: auto;
  min-width: 0;
}

.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #64748b;
}

.preview-header h3 {
  margin: 0;
  color: #0f172a;
}

.close-preview {
  border: none;
  background: #e2e8f0;
  color: #0f172a;
  border-radius: 999px;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
}

.preview-frame-wrap {
  position: absolute;
  inset: 0;
  border: none;
  border-radius: 0;
  overflow: hidden;
  background: transparent;
}

.preview-frame,
.preview-loading {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.preview-loading {
  display: grid;
  place-items: center;
  color: #475569;
  font-weight: 600;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
  position: absolute;
  left: 16px;
  bottom: 16px;
  max-width: min(100%, calc(100vw - 32px));
  padding: 12px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.24);
  z-index: 2;
  pointer-events: none;
}

.preview-actions > * {
  pointer-events: auto;
}

.preview-action-button {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border-radius: 999px;
  min-width: 88px;
  min-height: 40px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.preview-action-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.34);
}

.preview-cancel-button {
  min-width: 44px;
  padding-inline: 0;
  font-size: 18px;
  line-height: 1;
}

.preview-actions .success,
.preview-actions .error,
.preview-actions > span {
  color: #ffffff;
  font-weight: 600;
}

.success {
  color: #059669;
}

.error {
  color: #b91c1c;
}
</style>
