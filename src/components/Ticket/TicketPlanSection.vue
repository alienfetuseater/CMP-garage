<template>
  <section class="plan-block">
    <div class="section-heading profile-section-heading">
      <h3>{{ title }}</h3>
      <p>{{ completedCount }} of {{ totalCount }} {{ itemLabel }} complete ({{ progress }}%)</p>
    </div>

    <div v-if="totalCount > 0" class="plan-items">
      <label v-for="item in items" :key="item.id" class="plan-item">
        <input type="checkbox" :checked="item.completed" disabled />
        <span :class="{ done: item.completed }">{{ item.text }}</span>
        <span v-if="showCost" class="part-cost">{{ formatCurrency(item.cost ?? 0) }}</span>
      </label>
    </div>
    <div v-else class="empty-state">{{ emptyText }}</div>
  </section>
</template>

<script setup lang="ts">
import { formatCurrency } from '@/domain/tickets/currency'

type PlanItem = {
  id: string
  text: string
  completed: boolean
  cost?: number
}

withDefaults(
  defineProps<{
    title: string
    completedCount: number
    totalCount: number
    progress: number
    itemLabel: string
    items: PlanItem[]
    emptyText: string
    showCost?: boolean
  }>(),
  {
    showCost: false,
  },
)
</script>

<style scoped>
.plan-block {
  margin-top: 24px;
  display: grid;
  gap: 12px;
}

.section-heading h3 {
  margin: 0 0 12px;
  color: #0f172a;
}

.plan-items {
  display: grid;
  gap: 8px;
}

.plan-item {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #0f172a;
  font-weight: 500;
}

.plan-item .done {
  text-decoration: line-through;
  color: #64748b;
}

.part-cost {
  margin-left: auto;
  color: #334155;
  font-weight: 700;
}

.empty-state {
  padding: 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #475569;
  background: #f8fafc;
  text-align: center;
}
</style>
