<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar/nav-bar.vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

onMounted(() => {
  uiStore.fetchAllData().catch(() => {})
})
</script>

<template>
  <NavBar />

  <main class="page-content">
    <RouterView v-slot="{ Component, route }">
      <Transition name="route-fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>
  </main>
</template>

<style scoped>
.page-content {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: clamp(0.75rem, 2vw, 1.25rem);
}

:global(.route-fade-enter-active),
:global(.route-fade-leave-active) {
  transition:
    opacity 200ms ease,
    transform 220ms ease;
}

:global(.route-fade-enter-from),
:global(.route-fade-leave-to) {
  opacity: 0;
  transform: translateY(3px);
}

:global(.route-fade-enter-to),
:global(.route-fade-leave-from) {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 640px) {
  .page-content {
    padding: 0.75rem;
  }
}
</style>
