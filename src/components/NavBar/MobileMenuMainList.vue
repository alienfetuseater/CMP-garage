<template>
  <div class="mobile-menu-list">
    <button
      v-if="showCustomerRegistration"
      type="button"
      class="mobile-menu-item"
      @click="emit('go-to-route', 'CustomerRegistration')"
    >
      New Customer
    </button>
    <button
      v-if="showDirectory"
      type="button"
      class="mobile-menu-item"
      @click="emit('go-to-route', 'CustomerDirectory')"
    >
      Directory
    </button>
    <button
      v-if="showAssignmentBoard"
      type="button"
      class="mobile-menu-item"
      @click="emit('go-to-route', 'AssignmentBoard')"
    >
      Assignment Board
    </button>
    <button
      v-if="showUserManagement"
      type="button"
      class="mobile-menu-item"
      @click="emit('go-to-route', 'Register')"
    >
      User Registration
    </button>
    <button
      v-if="showUserManagement"
      type="button"
      class="mobile-menu-item"
      @click="emit('go-to-route', 'UserDirectory')"
    >
      Registered Users
    </button>
    <button
      type="button"
      class="mobile-menu-item"
      @click="emit('open-mobile-menu-panel', 'messages')"
    >
      Team Messages
      <span class="mobile-menu-count">{{ messageBadgeCountLabel }}</span>
    </button>
    <button type="button" class="mobile-menu-item" @click="emit('open-archived-conversations')">
      Archived Conversations
    </button>
    <button
      v-if="showReminders"
      type="button"
      class="mobile-menu-item"
      @click="emit('open-mobile-menu-panel', 'reminders')"
    >
      Reminders
      <span class="mobile-menu-count">{{ badgeCountLabel }}</span>
    </button>
    <button
      v-if="showOpenTickets"
      type="button"
      class="mobile-menu-item"
      @click="emit('open-mobile-menu-panel', 'tickets')"
    >
      Tickets
      <span class="mobile-menu-count">{{ ticketBadgeCountLabel }}</span>
    </button>
    <button type="button" class="mobile-menu-item" @click="emit('logout')">Logout</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showUserManagement: boolean
  showAssignmentBoard: boolean
  showCustomerRegistration: boolean
  showReminders: boolean
  showOpenTickets: boolean
  showDirectory: boolean
  messageBadgeCountLabel: string
  badgeCountLabel: string
  ticketBadgeCountLabel: string
}>()

const emit = defineEmits<{
  (
    event: 'go-to-route',
    routeName:
      | 'CustomerRegistration'
      | 'CustomerDirectory'
      | 'Register'
      | 'UserDirectory'
      | 'AssignmentBoard',
  ): void
  (event: 'open-mobile-menu-panel', view: 'messages' | 'reminders' | 'tickets'): void
  (event: 'open-archived-conversations'): void
  (event: 'logout'): void
}>()
</script>

<style scoped>
.mobile-menu-list {
  display: grid;
  gap: 0.45rem;
}

.mobile-menu-item {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  padding: 0.7rem 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  cursor: pointer;
  text-align: left;
}

.mobile-menu-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  padding: 0.15rem 0.4rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.8rem;
  font-weight: 700;
}
</style>
