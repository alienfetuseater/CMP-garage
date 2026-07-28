<template>
  <section class="notes-block">
    <div class="section-heading profile-section-heading">
      <h3>{{ title }}</h3>
    </div>

    <p v-if="text" class="notes-text">{{ text }}</p>
    <div v-if="photos.length" class="photo-grid">
      <figure v-for="photo in photos" :key="photo.id" class="photo-card">
        <img :src="photo.dataUrl" :alt="photo.name" class="photo-preview" />
        <figcaption class="photo-meta">
          <span>{{ photo.name?.trim() || 'Ticket Photo' }}</span>
          <span>{{ formatLocalDateTime(photo.uploadedAt) }}</span>
        </figcaption>
      </figure>
    </div>
    <div v-if="!text && !photos.length" class="empty-state">
      {{ emptyText }}
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TicketPhotoAttachment } from '@/types/mock'
import { formatLocalDateTime } from '@/shared/datetime/format'

withDefaults(
  defineProps<{
    title: string
    text?: string
    photos?: TicketPhotoAttachment[]
    emptyText: string
  }>(),
  {
    text: '',
    photos: () => [],
  },
)
</script>

<style scoped>
.notes-block {
  margin-top: 24px;
}

.section-heading h3 {
  margin: 0 0 12px;
  color: #0f172a;
}

.notes-text {
  margin: 0;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  white-space: pre-wrap;
}

.photo-grid {
  --ticket-photo-tile-width: 260px;
  --ticket-photo-tile-height: 195px;
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--ticket-photo-tile-width));
  gap: 12px;
  justify-content: flex-start;
  margin-top: 12px;
}

.photo-card {
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

.empty-state {
  padding: 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #475569;
  background: #f8fafc;
  text-align: center;
}

@media (max-width: 720px) {
  .photo-grid {
    grid-template-columns: 1fr;
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
