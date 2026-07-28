<template>
  <section class="photo-section">
    <h3 class="photo-title">Vessel Photo</h3>

    <div class="photo-preview-wrap" v-if="modelValue">
      <img class="photo-preview" :src="modelValue" alt="Vessel preview" />
    </div>

    <p v-else class="hint">No vessel photo uploaded yet.</p>

    <div class="photo-actions">
      <input ref="photoInputRef" type="file" accept="image/*" class="visually-hidden" @change="handleSelection" />
      <button type="button" class="secondary" @click="openPicker">
        {{ modelValue ? 'Change photo' : 'Upload photo' }}
      </button>
      <button v-if="modelValue" type="button" class="secondary danger" @click="removePhoto">
        Remove photo
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'error', value: string): void
}>()

const photoInputRef = ref<HTMLInputElement | null>(null)

function openPicker() {
  photoInputRef.value?.click()
}

function removePhoto() {
  emit('update:modelValue', '')
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const value = String(reader.result || '')
      resolve(value)
    }
    reader.onerror = () => reject(new Error('Unable to read selected image'))
    reader.readAsDataURL(file)
  })
}

async function handleSelection(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file')
    }

    const maxBytes = 5 * 1024 * 1024
    if (file.size > maxBytes) {
      throw new Error('Image is too large. Use a file up to 5MB')
    }

    emit('update:modelValue', await readFileAsDataUrl(file))
    emit('error', '')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : String(err))
  } finally {
    input.value = ''
  }
}
</script>

<style scoped>
.photo-section {
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
  padding: 16px;
  display: grid;
  gap: 12px;
}

.photo-title {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.photo-preview-wrap {
  width: min(100%, 420px);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #ffffff;
}

.photo-preview {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.photo-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.secondary {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}

.secondary.danger {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.hint {
  margin: 0;
  color: #64748b;
}
</style>
