<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import NavBar from './components/NavBar/nav-bar.vue'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const uiStore = useUiStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const isAuthScreen = computed(() => route.name === 'Login' || route.name === 'Register')

const loadAppData = async (force = false) => {
  if (!authStore.isAuthenticated) return
  await uiStore.fetchAllData(force).catch(() => {})
}

onMounted(async () => {
  await authStore.initializeAuth()
  if (!authStore.isAuthenticated && !isAuthScreen.value) {
    await router.replace({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  await loadAppData()
})

watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated, wasAuthenticated) => {
    if (!isAuthenticated) {
      uiStore.resetState()
      if (!isAuthScreen.value) {
        await router.replace({ name: 'Login', query: { redirect: route.fullPath } })
      }
      return
    }

    if (!wasAuthenticated) {
      await loadAppData(true)
    }
  },
)
</script>

<template>
  <NavBar v-if="authStore.isAuthenticated && !isAuthScreen" />

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
