<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar/nav-bar.vue'
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
