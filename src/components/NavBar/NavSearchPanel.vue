<template>
  <div class="search-wrap" @focusin="emit('focus')" @focusout="emit('blur')">
    <input
      :value="searchQuery"
      class="search-input"
      type="search"
      placeholder="Search customers, vessels, or tickets"
      aria-label="Search customers, vessels, or tickets"
      @input="emit('update:search-query', ($event.target as HTMLInputElement).value)"
      @focus="emit('focus')"
    />

    <div v-if="showResults && searchQuery.trim()" class="search-results">
      <div v-if="!hasAnyResults" class="search-empty">No matches found.</div>

      <section v-if="filteredCustomers.length" class="search-group">
        <h4>Customers</h4>
        <button
          v-for="customer in filteredCustomers"
          :key="customer.id"
          type="button"
          class="search-item"
          @mousedown.prevent
          @click="emit('open-customer', customer.id)"
        >
          <span class="result-title">{{ customer.name }}</span>
          <span class="result-meta">{{ customer.phone }} · {{ customer.email }}</span>
        </button>
      </section>

      <section v-if="filteredVessels.length" class="search-group">
        <h4>Vessels</h4>
        <button
          v-for="vessel in filteredVessels"
          :key="vessel.id"
          type="button"
          class="search-item"
          @mousedown.prevent
          @click="emit('open-vessel', vessel.id)"
        >
          <span class="result-title">{{ vessel.vesselName }}</span>
          <span class="result-meta"
            >{{ vessel.vesselMake }} ({{ vessel.vesselYear }}) · {{ vessel.customerName }}</span
          >
        </button>
      </section>

      <section v-if="filteredTickets.length" class="search-group">
        <h4>Tickets</h4>
        <button
          v-for="ticket in filteredTickets"
          :key="ticket.id"
          type="button"
          class="search-item"
          @mousedown.prevent
          @click="emit('open-ticket', ticket.id)"
        >
          <span class="result-title">{{ ticket.service_title }}</span>
          <span class="result-meta"
            >{{ ticket.status }} · {{ ticket.priority }} · {{ ticket.customerName || 'Customer' }}</span
          >
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Customer, Ticket, Vessel } from '@/types/mock'

defineProps<{
  searchQuery: string
  showResults: boolean
  hasAnyResults: boolean
  filteredCustomers: Customer[]
  filteredVessels: Vessel[]
  filteredTickets: Ticket[]
}>()

const emit = defineEmits<{
  (event: 'update:search-query', value: string): void
  (event: 'focus'): void
  (event: 'blur'): void
  (event: 'open-customer', id: string): void
  (event: 'open-vessel', id: string): void
  (event: 'open-ticket', id: string): void
}>()
</script>

<style scoped>
.search-wrap {
  flex: 1 1 340px;
  min-width: 280px;
  max-width: 500px;
  position: relative;
}

.search-input {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.5);
  border-radius: 999px;
  padding: 0.7rem 0.95rem;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font: inherit;
}

.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: min(100%, 520px);
  max-height: 70vh;
  overflow: auto;
  padding: 0.8rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
  z-index: 200;
}

.search-empty {
  padding: 0.6rem 0.2rem;
  color: #64748b;
}

.search-group + .search-group {
  margin-top: 0.75rem;
}

.search-group h4 {
  margin: 0 0 0.45rem;
  color: #0f172a;
  font-size: 0.9rem;
}

.search-item {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  padding: 0.65rem 0.7rem;
  margin-top: 0.35rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  cursor: pointer;
  text-align: left;
}

.result-title {
  font-weight: 700;
  color: #0f172a;
}

.result-meta {
  color: #64748b;
  font-size: 0.9rem;
}
</style>
