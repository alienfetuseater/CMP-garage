<template>
  <section class="history-block">
    <div class="history-header">
      <h3>{{ title }}</h3>
      <span class="history-count">{{ items.length }}</span>
    </div>

    <div v-if="loading" class="history-loading">Loading...</div>

    <div v-else-if="items.length" class="history-list">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="history-item"
        @click="$emit('open-item', item.id)"
      >
        <div class="history-item-top">
          <strong>{{ getTitle(item) }}</strong>
          <span class="history-status">{{ item.status || 'Active' }}</span>
        </div>
        <div class="history-item-bottom">
          <span>{{ item.priority || 'Normal' }}</span>
          <span>{{
            formatDate(
              (
                item as Ticket & {
                  scheduledDate?: string
                  serviceDate?: string
                  createdAt?: string
                  created_at?: string
                }
              ).scheduledDate ||
                (item as Ticket & { serviceDate?: string }).serviceDate ||
                item.createdAt,
            )
          }}</span>
        </div>
      </button>
    </div>

    <div v-else class="history-empty">
      {{ emptyMessage }}
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Ticket } from '@/types/mock'

defineProps<{
  title: string
  items: Ticket[]
  loading: boolean
  emptyMessage: string
}>()

defineEmits<{
  (event: 'open-item', id: string): void
}>()

function getTitle(item: Ticket) {
  const itemWithExtras = item as Ticket & {
    serviceTitle?: string
    service_title?: string
    title?: string
  }

  return (
    itemWithExtras.serviceTitle ||
    itemWithExtras.service_title ||
    itemWithExtras.title ||
    'Service record'
  )
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'No date'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.history-block {
  background: #313447;
  border: 1px solid #44475a;
  border-radius: 10px;
  padding: 18px;
  box-shadow: none;
  display: grid;
  gap: 12px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.history-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #f8f8f2;
}

.history-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #44475a;
  color: #8be9fd;
  font-weight: 700;
  padding: 0 8px;
}

.history-list {
  display: grid;
  gap: 10px;
}

.history-item {
  width: 100%;
  border: 1px solid #44475a;
  border-radius: 8px;
  padding: 12px 14px;
  background: #3a3f52;
  color: #f8f8f2;
  text-align: left;
  cursor: pointer;
  display: grid;
  gap: 8px;
  transition: background 0.15s ease;
}

.history-item:hover {
  background: #44475a;
}

.history-item-top,
.history-item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.history-status {
  color: #8be9fd;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.history-empty,
.history-loading {
  color: #a7adce;
  font-size: 0.95rem;
}
</style>
