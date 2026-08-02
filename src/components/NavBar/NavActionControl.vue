<template>
  <component
    :is="to ? RouterLink : 'button'"
    class="nav-icon-link"
    :class="{ 'has-label': label }"
    :aria-label="ariaLabel"
    :title="title"
    v-bind="to ? { to } : {}"
    :type="to ? undefined : 'button'"
    @click="handleClick"
  >
    <slot />
    <span v-if="label" class="nav-action-label">{{ label }}</span>
  </component>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const props = defineProps<{
  to?: string
  ariaLabel: string
  title: string
  label?: string
}>()

const emit = defineEmits<{
  (event: 'click'): void
}>()

function handleClick() {
  if (!props.to) {
    emit('click')
  }
}
</script>

<style scoped>
.nav-icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(142, 185, 229, 0.28);
  background: linear-gradient(180deg, rgba(78, 137, 204, 0.28), rgba(16, 36, 58, 0.9));
  color: var(--color-ocean-mist);
  cursor: pointer;
  text-decoration: none;
}

.nav-icon-link.has-label {
  width: auto;
  padding: 0 0.8rem;
  gap: 0.45rem;
  border-radius: 8px;
}

.nav-action-label {
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}
</style>
