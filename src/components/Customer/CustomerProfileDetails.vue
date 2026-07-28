<template>
  <ul class="details">
    <li><strong>Phone</strong> {{ formattedPhone }}</li>
    <li><strong>Email</strong> {{ email }}</li>
    <li><strong>Address</strong> {{ address }}</li>
    <li><strong>Profile created</strong> {{ createdAt }}</li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  formattedPhone: string
  email: string
  address: string
  createdAt: string
}>()
</script>

<style scoped>
.details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.details li {
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f172a;
}

.details strong {
  display: block;
  margin-bottom: 4px;
  color: #475569;
}
</style>
