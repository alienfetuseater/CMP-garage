<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import NavBar from './components/NavBar/nav-bar.vue'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import {
  applyVisualTheme,
  readVisualTheme,
  saveVisualTheme,
  type VisualTheme,
} from '@/services/ui/visualTheme'
import {
  connectRealtimeMessaging,
  disconnectRealtimeMessaging,
} from '@/services/realtime/messaging'

const uiStore = useUiStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const visualTheme = ref<VisualTheme>(readVisualTheme())

const isAuthScreen = computed(() => route.meta.authScreen === true)
const hasSession = computed(() => Boolean(authStore.token))
const isDarkTheme = computed(() => visualTheme.value === 'dark')

function toggleVisualTheme() {
  visualTheme.value = isDarkTheme.value ? 'light' : 'dark'
  applyVisualTheme(visualTheme.value)
  saveVisualTheme(visualTheme.value)
}

const loadAppData = async (force = false) => {
  if (!hasSession.value) return
  await uiStore.fetchAllData(force).catch(() => {})
}

const refreshAuthenticatedUser = async () => {
  if (!authStore.token) return
  await authStore.fetchMe()
}

const refreshAuthenticatedSession = async () => {
  await refreshAuthenticatedUser()
  await loadAppData(true)
}

onMounted(async () => {
  await refreshAuthenticatedUser()
  window.addEventListener('focus', refreshAuthenticatedSession)
  if (!hasSession.value && !isAuthScreen.value) {
    await router.replace({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  if (authStore.token) {
    connectRealtimeMessaging(authStore.token)
  }
  await loadAppData()
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', refreshAuthenticatedSession)
})

watch(
  () => authStore.token,
  async (token, previousToken) => {
    const hasToken = Boolean(token)
    const hadToken = Boolean(previousToken)

    if (!hasToken) {
      disconnectRealtimeMessaging()
      uiStore.resetState()
      if (!isAuthScreen.value) {
        await router.replace({ name: 'Login', query: { redirect: route.fullPath } })
      }
      return
    }

    connectRealtimeMessaging(token)

    if (!hadToken) {
      await loadAppData(true)
    }
  },
)
</script>

<template>
  <NavBar v-if="!isAuthScreen" />

  <button
    type="button"
    class="visual-theme-toggle"
    :aria-pressed="isDarkTheme"
    :title="isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggleVisualTheme"
  >
    <svg v-if="isDarkTheme" class="theme-toggle-icon" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M13 3l-1.4 1.4M4.4 11.6 3 13"
      />
    </svg>
    <svg v-else class="theme-toggle-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M13.2 10.3A5.5 5.5 0 0 1 5.7 2.8 5.5 5.5 0 1 0 13.2 10.3Z" />
    </svg>
    <span>{{ isDarkTheme ? 'Light Theme' : 'Dark Theme' }}</span>
  </button>

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
  max-width: none;
  margin: 0 auto;
  padding: 0;
}

.visual-theme-toggle {
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 500;
  width: 122px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 0;
  border-radius: 0;
  padding: 0.2rem 0.6rem;
  background: var(--vscode-statusBar-background);
  color: var(--vscode-statusBar-foreground);
  box-shadow: none;
  font-family: var(--font-primary);
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
}

.visual-theme-toggle:hover {
  background: var(--vscode-statusBar-hoverBackground);
}

.theme-toggle-icon {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.2;
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

  .visual-theme-toggle {
    right: 0;
    bottom: 0;
  }
}
</style>
