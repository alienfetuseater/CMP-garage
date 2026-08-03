<template>
  <section class="ticket-assessment-section">
    <div class="section-heading">
      <h3>Initial Assessment</h3>
      <p>Capture the first assessment notes for this service ticket.</p>
    </div>

    <div class="photo-actions">
      <button
        type="button"
        class="ghost icon-button"
        aria-label="Browse"
        title="Browse"
        @click="openBrowsePicker"
      >
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 16V6M12 6L8.5 9.5M12 6L15.5 9.5M5 15.5V17.5C5 18.6 5.9 19.5 7 19.5H17C18.1 19.5 19 18.6 19 17.5V15.5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="action-label">Browse</span>
      </button>
      <button
        type="button"
        class="ghost icon-button"
        aria-label="Take photo"
        title="Take photo"
        @click="openCameraPicker"
      >
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 8.5C4 7.4 4.9 6.5 6 6.5H8.4L9.5 5H14.5L15.6 6.5H18C19.1 6.5 20 7.4 20 8.5V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V8.5Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="12.5" r="3" stroke="currentColor" stroke-width="1.8" />
        </svg>
        <span class="action-label">Take Photo</span>
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

    <div v-if="form.initialAssessmentPhotos.length" class="photo-grid">
      <figure v-for="photo in form.initialAssessmentPhotos" :key="photo.id" class="photo-card">
        <button
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
          <label class="photo-caption-label">
            Photo Caption
            <input
              :value="photo.name"
              type="text"
              class="photo-caption-input"
              placeholder="Brief photo description"
              @input="photo.name = ($event.target as HTMLInputElement).value"
            />
          </label>
          <span>{{ formatLocalDateTime(photo.uploadedAt) }}</span>
        </figcaption>
      </figure>
    </div>

    <textarea
      :value="form.initialAssessment"
      rows="4"
      placeholder="Enter initial assessment notes"
      @input="form.initialAssessment = ($event.target as HTMLTextAreaElement).value"
    />

    <div class="section-heading">
      <h3>Recommended Service</h3>
      <p>Document recommended service notes based on findings.</p>
    </div>

    <textarea
      :value="form.recommendedService"
      rows="4"
      placeholder="Enter recommended service notes"
      @input="form.recommendedService = ($event.target as HTMLTextAreaElement).value"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatLocalDateTime } from '@/shared/datetime/format'
import {
  createTicketPhotoAttachment,
  derivePhotoCaption,
  resizeTicketPhoto,
} from '@/domain/tickets/photos'
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

const props = defineProps<{ form: TicketFormState }>()
const emit = defineEmits<{ (event: 'error', message: string): void }>()

const MAX_TICKET_PHOTO_WIDTH = 1600
const MAX_TICKET_PHOTO_HEIGHT = 1200
const TICKET_PHOTO_JPEG_QUALITY = 0.82

const browseInput = ref<HTMLInputElement | null>(null)
const cameraInput = ref<HTMLInputElement | null>(null)

function openBrowsePicker() {
  browseInput.value?.click()
}

function openCameraPicker() {
  cameraInput.value?.click()
}

function removePhoto(photoId: string) {
  props.form.initialAssessmentPhotos = props.form.initialAssessmentPhotos.filter(
    (photo) => photo.id !== photoId,
  )
}

async function handlePhotoSelection(event: Event) {
  const input = event.target as HTMLInputElement | null
  try {
    if (!input?.files?.length) return

    const nextPhotos = await Promise.all(
      Array.from(input.files).map(async (file) => {
        const dataUrl = await resizeTicketPhoto(file, {
          maxWidth: MAX_TICKET_PHOTO_WIDTH,
          maxHeight: MAX_TICKET_PHOTO_HEIGHT,
          jpegQuality: TICKET_PHOTO_JPEG_QUALITY,
        })
        return createTicketPhotoAttachment(derivePhotoCaption(file.name), dataUrl)
      }),
    )

    props.form.initialAssessmentPhotos = [...props.form.initialAssessmentPhotos, ...nextPhotos]
  } catch (err) {
    emit('error', err instanceof Error ? err.message : String(err))
  } finally {
    if (input) input.value = ''
  }
}
</script>

<style scoped>
.ticket-assessment-section {
  display: grid;
  gap: 16px;
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

.photo-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.action-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
}

.action-label {
  display: inline;
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

.photo-grid {
  --ticket-photo-tile-width: 260px;
  --ticket-photo-tile-height: 195px;
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--ticket-photo-tile-width));
  gap: 12px;
  justify-content: flex-start;
}

.photo-card {
  position: relative;
  margin: 0;
  padding: 10px;
  width: var(--ticket-photo-tile-width);
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
}

.photo-preview {
  display: block;
  width: var(--ticket-photo-tile-width);
  height: var(--ticket-photo-tile-height);
  object-fit: cover;
  border-radius: 12px;
  background: #e2e8f0;
}

.photo-meta {
  display: grid;
  gap: 4px;
  margin-top: 8px;
  color: #475569;
  font-size: 0.9rem;
}

.photo-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(15, 23, 42, 0.25);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.7);
  color: #ffffff;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.photo-remove:hover {
  background: rgba(127, 29, 29, 0.92);
}

.photo-caption-label {
  display: grid;
  gap: 6px;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.photo-caption-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 10px;
  font: inherit;
  color: #0f172a;
  background: #ffffff;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #334155;
  font-weight: 600;
  min-width: 0;
}

textarea,
input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  background: #ffffff;
  color: #0f172a;
}

textarea {
  resize: vertical;
}

:global(body.theme-dark) .ticket-assessment-section {
  background: transparent;
  border-color: rgba(98, 114, 164, 0.28);
  color: #f8f8f2;
}

:global(body.theme-dark) .ticket-assessment-section .section-heading h3,
:global(body.theme-dark) .ticket-assessment-section .section-heading p,
:global(body.theme-dark) .ticket-assessment-section label,
:global(body.theme-dark) .ticket-assessment-section .photo-caption-label {
  color: #f8f8f2;
}

:global(body.theme-dark) .ticket-assessment-section textarea,
:global(body.theme-dark) .ticket-assessment-section input,
:global(body.theme-dark) .ticket-assessment-section .photo-caption-input {
  background: #282a36;
  border-color: #6272a4;
  color: #f8f8f2;
}

:global(body.theme-dark) .ticket-assessment-section .photo-card {
  background: #3a3f52;
  border-color: #44475a;
}

:global(body.theme-dark) .ticket-assessment-section .photo-preview {
  background: #282a36;
}

.ghost {
  border: 1px solid var(--color-ocean-deep);
  background: var(--color-ocean-muted);
  color: var(--color-ocean-dark);
  border-radius: 999px;
  min-height: 42px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .photo-grid {
    grid-template-columns: 1fr;
  }

  .icon-button {
    width: 42px;
    min-width: 42px;
    padding: 0;
    justify-content: center;
  }

  .action-icon {
    width: 20px;
    height: 20px;
    flex-basis: 20px;
  }

  .action-label {
    display: none;
  }

  .photo-card,
  .photo-preview {
    width: 100%;
  }

  .photo-preview {
    height: auto;
    aspect-ratio: 4 / 3;
  }
}
</style>
