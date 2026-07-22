<template>
  <main class="dossier-page">
    <section class="dossier-card">
      <p class="eyebrow">Vessel dossier</p>
      <h2>Generate Vessel Dossier</h2>
      <p v-if="vesselId" class="dossier-meta">Vessel ID: {{ vesselId }}</p>
      <p v-if="ticketId" class="dossier-meta">Source ticket: {{ ticketId }}</p>
      <p v-if="customerId" class="dossier-meta">Customer ID: {{ customerId }}</p>

      <p class="dossier-copy">
        This page is ready for the dossier workflow. You can use the vessel profile and ticket
        history from here to assemble the final document.
      </p>

      <div class="dossier-actions">
        <RouterLink class="secondary-link" :to="vesselProfileRoute">Open Vessel Profile</RouterLink>
        <RouterLink class="secondary-link" :to="ticketRoute">Back to Ticket</RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const vesselId = computed(() => String(route.query.vesselId || ''))
const ticketId = computed(() => String(route.query.ticketId || ''))
const customerId = computed(() => String(route.query.customerId || ''))

const vesselProfileRoute = computed(() => ({
  name: 'VesselProfile',
  query: vesselId.value ? { id: vesselId.value } : undefined,
}))

const ticketRoute = computed(() => ({
  name: 'Ticket',
  query: ticketId.value ? { id: ticketId.value } : undefined,
}))
</script>

<style scoped>
.dossier-page {
  min-height: calc(100vh - 24px);
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.dossier-card {
  width: min(100%, 760px);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #64748b;
}

h2 {
  margin: 0;
  color: #0f172a;
}

.dossier-meta {
  margin: 8px 0 0;
  color: #334155;
}

.dossier-copy {
  margin: 16px 0 0;
  color: #475569;
  line-height: 1.6;
}

.dossier-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.secondary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  text-decoration: none;
  font-weight: 600;
}

.secondary-link:hover {
  background: #dbeafe;
}
</style>
