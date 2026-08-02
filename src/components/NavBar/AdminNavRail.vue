<template>
  <aside class="admin-rail" aria-label="Management navigation">
    <nav class="admin-rail-actions">
      <NavActionControl
        v-if="showCustomerRegistration"
        to="/CustomerRegistration"
        :ariaLabel="'Client Registration'"
        title="Client Registration"
      >
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 12.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" />
          <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
          <path d="M19 5v6M16 8h6" />
        </svg>
      </NavActionControl>

      <NavActionControl
        v-if="showDirectory"
        to="/CustomerDirectory"
        :ariaLabel="'Client Directory'"
        title="Client Directory"
      >
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M2.5 4h5A4.5 4.5 0 0 1 12 8.5V21a3.5 3.5 0 0 0-3.5-3.5h-6Z" />
          <path d="M21.5 4h-5A4.5 4.5 0 0 0 12 8.5V21a3.5 3.5 0 0 1 3.5-3.5h6Z" />
        </svg>
      </NavActionControl>

      <NavActionControl
        v-if="showUserManagement"
        to="/register"
        :ariaLabel="'Employee Registration'"
        title="Employee Registration"
      >
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="2.5" y="5.5" width="13" height="15" rx="1.5" />
          <path d="M6 3.5v4M12 3.5v4" />
          <circle cx="9" cy="11.5" r="2" />
          <path d="M5.5 17a3.5 3.5 0 0 1 7 0" />
          <path d="M19.5 8.5v7M16 12h7" />
        </svg>
      </NavActionControl>

      <NavActionControl
        v-if="showUserManagement"
        to="/users"
        :ariaLabel="'Employee Directory'"
        title="Employee Directory"
      >
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 6V4h12v2" />
          <rect x="3.5" y="6" width="17" height="13" rx="1.5" />
          <circle cx="9" cy="11" r="2" />
          <path d="M6.5 16a2.5 2.5 0 0 1 5 0M14 10h3.5M14 13h3.5M14 16h2" />
          <path d="M6 19v2M18 19v2M4.5 21h15" />
        </svg>
      </NavActionControl>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import NavActionControl from '@/components/NavBar/NavActionControl.vue'

defineProps<{
  showCustomerRegistration: boolean
  showDirectory: boolean
  showUserManagement: boolean
}>()
</script>

<style scoped>
.admin-rail {
  position: fixed;
  top: 50%;
  right: 0;
  z-index: 900;
  width: 48px;
  max-height: calc(100vh - 72px);
  transform: translateY(-50%);
  overflow-y: auto;
  border-left: 1px solid var(--vscode-panel-border);
  border-bottom: 1px solid var(--vscode-panel-border);
  background: var(--vscode-titleBar-activeBackground);
}

.admin-rail-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px;
}

.admin-rail-actions :deep(.nav-icon-link) {
  flex: 0 0 40px;
  width: 40px !important;
  height: 40px !important;
  min-height: 40px !important;
  padding: 6px !important;
}

.nav-icon {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}
</style>
