<template>
  <article class="diagnostic-field">
    <label class="diagnostic-value">
      {{ label }}
      <select
        :value="entry.value"
        :disabled="readonly"
        @change="
          updateEntry({ value: ($event.target as HTMLSelectElement).value as DiagnosticLevel })
        "
      >
        <option value="good">good</option>
        <option value="monitor">monitor</option>
        <option value="action">action</option>
        <option value="N/A">N/A</option>
      </select>
    </label>

    <div v-if="!readonly" class="field-actions">
      <button type="button" class="ghost" @click="showComment = !showComment">
        {{ showComment ? 'Hide Comment' : 'Add Comment' }}
      </button>
      <button type="button" class="ghost" @click="showPhotos = !showPhotos">
        {{ showPhotos ? 'Hide Photos' : 'Add Photo' }}
      </button>
    </div>

    <label v-if="showComment" class="comment-field">
      Comment
      <textarea
        :value="entry.comment"
        rows="3"
        :readonly="readonly"
        placeholder="Add a comment for this diagnostic item"
        @input="updateEntry({ comment: ($event.target as HTMLTextAreaElement).value })"
      />
    </label>

    <section v-if="showPhotos" class="photos-section">
      <div v-if="!readonly" class="photo-actions">
        <button type="button" class="ghost icon-button" @click="browseInput?.click()">
          Browse
        </button>
        <button type="button" class="ghost icon-button" @click="cameraInput?.click()">
          Take Photo
        </button>
        <input
          ref="browseInput"
          class="sr-only"
          type="file"
          accept="image/*"
          multiple
          @change="handlePhotoSelection"
        />
        <input
          ref="cameraInput"
          class="sr-only"
          type="file"
          accept="image/*"
          capture="environment"
          @change="handlePhotoSelection"
        />
      </div>

      <div v-if="entry.photos.length" class="photo-grid">
        <figure v-for="photo in entry.photos" :key="photo.id" class="photo-card">
          <button
            v-if="!readonly"
            type="button"
            class="photo-remove"
            title="Remove photo"
            aria-label="Remove photo"
            @click="removePhoto(photo.id)"
          >
            X
          </button>
          <img :src="photo.dataUrl" :alt="photo.name" class="photo-preview" />
          <figcaption class="photo-meta">
            <label v-if="!readonly" class="photo-caption-label">
              Photo Caption
              <input
                :value="photo.name"
                type="text"
                class="photo-caption-input"
                @input="updatePhotoCaption(photo.id, ($event.target as HTMLInputElement).value)"
              />
            </label>
            <strong v-else>{{ photo.name }}</strong>
            <span>{{ formatLocalDateTime(photo.uploadedAt) }}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  createTicketPhotoAttachment,
  derivePhotoCaption,
  resizeTicketPhoto,
} from '@/domain/tickets/photos'
import { formatLocalDateTime } from '@/shared/datetime/format'
import type { DiagnosticLevel, MonthlyReportDiagnosticEntry } from '@/types/mock'

const props = defineProps<{
  label: string
  entry: MonthlyReportDiagnosticEntry
  readonly?: boolean
}>()

const emit = defineEmits<{
  (event: 'error', message: string): void
  (event: 'update-entry', entry: MonthlyReportDiagnosticEntry): void
}>()

const showComment = ref(Boolean(props.entry.comment.trim()))
const showPhotos = ref(Boolean(props.entry.photos.length))
const browseInput = ref<HTMLInputElement | null>(null)
const cameraInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.entry.comment,
  (comment) => {
    if (comment.trim()) showComment.value = true
  },
  { immediate: true },
)

watch(
  () => props.entry.photos.length,
  (photoCount) => {
    if (photoCount) showPhotos.value = true
  },
  { immediate: true },
)

function removePhoto(photoId: string) {
  updateEntry({ photos: props.entry.photos.filter((photo) => photo.id !== photoId) })
}

function updatePhotoCaption(photoId: string, name: string) {
  updateEntry({
    photos: props.entry.photos.map((photo) => (photo.id === photoId ? { ...photo, name } : photo)),
  })
}

function updateEntry(changes: Partial<MonthlyReportDiagnosticEntry>) {
  emit('update-entry', { ...props.entry, ...changes })
}

async function handlePhotoSelection(event: Event) {
  const input = event.target as HTMLInputElement | null
  try {
    if (!input?.files?.length) return
    const photos = await Promise.all(
      Array.from(input.files).map(async (file) => {
        const dataUrl = await resizeTicketPhoto(file, {
          maxWidth: 1600,
          maxHeight: 1200,
          jpegQuality: 0.82,
        })
        return createTicketPhotoAttachment(derivePhotoCaption(file.name), dataUrl)
      }),
    )
    updateEntry({ photos: [...props.entry.photos, ...photos] })
  } catch (error) {
    emit('error', error instanceof Error ? error.message : String(error))
  } finally {
    if (input) input.value = ''
  }
}
</script>

<style scoped>
.diagnostic-field {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 14px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #ffffff;
}

.diagnostic-value,
.comment-field {
  display: grid;
  gap: 8px;
  color: #334155;
  font-weight: 600;
}

select,
textarea,
input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
  color: #0f172a;
  background: #ffffff;
}

textarea {
  resize: vertical;
}

.field-actions,
.photo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ghost {
  border: 1px solid var(--color-ocean-deep);
  border-radius: 10px;
  padding: 8px 12px;
  background: #ffffff;
  color: var(--color-ocean-dark);
  font-weight: 700;
  cursor: pointer;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sr-only {
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

.photos-section {
  display: grid;
  gap: 10px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.photo-card {
  position: relative;
  margin: 0;
  padding: 8px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #f8fbff;
}

.photo-preview {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
  background: #e2e8f0;
}

.photo-meta {
  display: grid;
  gap: 5px;
  margin-top: 8px;
  color: #475569;
  font-size: 0.85rem;
}

.photo-caption-label {
  display: grid;
  gap: 5px;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.photo-caption-input {
  padding: 7px 9px;
}

.photo-remove {
  position: absolute;
  z-index: 1;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(15, 23, 42, 0.25);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.75);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}
</style>
