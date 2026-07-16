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
    <RouterView />
  </main>
</template>

<style scoped>
.page-content {
  padding: 1rem;
}
</style>
