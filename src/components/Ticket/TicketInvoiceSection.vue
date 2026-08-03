<template>
  <section class="notes-block invoice-block">
    <div class="section-heading profile-section-heading">
      <h3>Invoice Cost</h3>
      <p>Total of selected required parts plus labor cost.</p>
    </div>

    <div class="invoice-summary">
      <p><strong>Selected Parts Total</strong> {{ formatCurrency(selectedPartsTotal) }}</p>
      <p><strong>Labor Cost</strong> {{ formatCurrency(normalizedLaborCost) }}</p>
      <p class="invoice-grand-total">
        <strong>Invoice Total</strong> {{ formatCurrency(invoiceTotal) }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatCurrency } from '@/domain/tickets/currency'

defineProps<{
  selectedPartsTotal: number
  normalizedLaborCost: number
  invoiceTotal: number
}>()
</script>

<style scoped>
.notes-block {
  margin-top: 24px;
}

.section-heading h3 {
  margin: 0 0 12px;
  color: #0f172a;
}

.invoice-block .section-heading p {
  margin: 4px 0 0;
}

.invoice-summary {
  display: grid;
  gap: 6px;
  color: #334155;
}

.invoice-summary p {
  margin: 0;
}

.invoice-grand-total {
  margin-top: 4px;
  color: #0f172a;
  font-size: 1.04rem;
}

:global(body.theme-dark) .invoice-block {
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: 0;
  color: #f8f8f2;
}

:global(body.theme-dark) .invoice-block .section-heading h3,
:global(body.theme-dark) .invoice-block .section-heading p,
:global(body.theme-dark) .invoice-block .invoice-summary,
:global(body.theme-dark) .invoice-block .invoice-grand-total {
  color: #f8f8f2;
}
</style>
