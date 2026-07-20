<template>
  <header class="top-nav">
    <nav>
      <ul>
        <li><RouterLink to="/">CMPHome</RouterLink></li>
        <li><RouterLink to="/NewTicket">New Ticket</RouterLink></li>
        <li><RouterLink to="/NewReminder">New Reminder</RouterLink></li>
        <li><RouterLink to="/CustomerRegistration">Customer Registration</RouterLink></li>
        <li><RouterLink to="/CustomerDirectory">Customer Directory</RouterLink></li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background-color: var(--color-navbar);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
}

nav {
  width: 100%;
}

ul {
  list-style: none;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 0;
  padding: 0.75rem 1rem;
}

li {
  flex: 1;
  text-align: center;
}

a,
:deep(a) {
  display: block;
  color: var(--color-navbar-text);
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

a:hover,
a.router-link-active,
:deep(a.router-link-active) {
  background-color: var(--color-link-hover);
  color: var(--color-surface);
}

.theme-toggle {
  width: 100%;
  border: 1px solid var(--color-border);
  background: var(--color-button-bg);
  color: var(--color-button-text);
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.16);
  transform: translateY(-1px);
}
</style>
