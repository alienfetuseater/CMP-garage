<template>
  <label class="assignee-field">
    Assigned Technician
    <select
      data-testid="assignee-select"
      :value="modelValue"
      :disabled="disabled || loading"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">Unassigned</option>
      <option v-for="user in users" :key="user.id" :value="user.id">
        {{ user.name }} · {{ roleLabels[user.role] }}
      </option>
    </select>
    <span v-if="loading" class="field-help">Loading users...</span>
    <span v-else-if="error" class="field-error">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { roleLabels } from '@/domain/auth/permissions'
import { fetchAssignableUsers } from '@/services/users/accounts'
import type { AuthUser } from '@/stores/auth/state'

defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const users = ref<AuthUser[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    users.value = await fetchAssignableUsers()
  } catch (loadError) {
    error.value = loadError instanceof Error ? loadError.message : String(loadError)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.assignee-field {
  display: grid;
  gap: 0.35rem;
  color: #1e293b;
  font-weight: 700;
}
select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  background: #fff;
  font: inherit;
}
select:focus {
  border-color: #0284c7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.14);
}
.field-help,
.field-error {
  font-size: 0.8rem;
  font-weight: 500;
}
.field-help {
  color: #64748b;
}
.field-error {
  color: #b91c1c;
}
</style>
