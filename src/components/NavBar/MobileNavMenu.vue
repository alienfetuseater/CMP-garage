<template>
  <div ref="mobileMenuWrapRef" class="mobile-menu-wrap" @click.stop>
    <button
      class="mobile-menu-btn"
      type="button"
      aria-label="Open navigation menu"
      :aria-expanded="showMobileMenu"
      @click="emit('toggle-mobile-menu')"
    >
      <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </svg>
    </button>

    <div v-if="showMobileMenu" class="mobile-menu-dropdown">
      <div class="mobile-menu-head">
        <strong>{{ mobileMenuTitle }}</strong>
        <button
          v-if="mobileMenuView !== 'menu'"
          type="button"
          class="mobile-menu-back"
          @click="emit('set-mobile-menu-view', 'menu')"
        >
          Back
        </button>
      </div>

      <MobileMenuMainList
        v-if="mobileMenuView === 'menu'"
        :message-badge-count-label="messageBadgeCountLabel"
        :badge-count-label="badgeCountLabel"
        :ticket-badge-count-label="ticketBadgeCountLabel"
        @go-to-route="(route) => emit('go-to-route', route)"
        @open-mobile-menu-panel="(view) => emit('open-mobile-menu-panel', view)"
        @open-archived-conversations="emit('open-archived-conversations')"
        @logout="emit('logout')"
      />

      <MobileMenuPanel v-else-if="mobileMenuView === 'messages'">
        <button type="button" class="notification-item archived-link" @click="emit('open-messages-page')">
          Open All Team Messages
        </button>

        <div v-if="messageConversations.length === 0" class="notifications-empty">
          No active internal conversations.
        </div>

        <template v-if="messageConversations.length > 0">
          <button
            v-for="conversation in messageConversations"
            :key="conversation.conversationId"
            type="button"
            class="notification-item"
            @click="emit('open-conversation', conversation)"
          >
            <span class="notification-title">
              {{ conversation.title }}
              <span v-if="conversation.unreadCount > 0" class="conversation-unread-badge">
                {{ conversation.unreadCount }}
              </span>
            </span>
            <span class="notification-meta">
              {{ conversation.subtitle }} · {{ conversation.partnerNames.join(', ') || 'Conversation' }} ·
              {{ formatDate(conversation.lastMessageAt) }}
            </span>
          </button>
        </template>

        <button type="button" class="notification-item archived-link" @click="emit('open-archived-conversations')">
          Open Archived Conversations
        </button>
      </MobileMenuPanel>

      <MobileMenuPanel v-else-if="mobileMenuView === 'reminders'">
        <div v-if="openRemindersList.length === 0" class="notifications-empty">No open reminders.</div>

        <template v-else>
          <button
            v-for="reminder in openRemindersList"
            :key="reminder.id"
            type="button"
            class="notification-item"
            @click="emit('open-reminder', reminder.id)"
          >
            <span class="notification-title">{{ reminder.title }}</span>
            <span class="notification-meta">{{ formatDate(reminder.dueDate) }}</span>
          </button>
        </template>
      </MobileMenuPanel>

      <MobileMenuPanel v-else>
        <div v-if="openTicketsList.length === 0" class="notifications-empty">No open tickets.</div>

        <template v-else>
          <button
            v-for="ticket in openTicketsList"
            :key="ticket.id"
            type="button"
            class="notification-item"
            @click="emit('open-ticket', ticket.id)"
          >
            <span class="notification-title">{{ ticket.service_title }}</span>
            <span class="notification-meta"
              >{{ ticket.status }} · {{ ticket.priority }} · {{ formatDate(ticket.scheduledDate) }}</span
            >
          </button>
        </template>
      </MobileMenuPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConversationSummary, Reminder, Ticket } from '@/types/mock'
import { formatLocalDateTime } from '@/shared/datetime/format'
import MobileMenuMainList from '@/components/NavBar/MobileMenuMainList.vue'
import MobileMenuPanel from '@/components/NavBar/MobileMenuPanel.vue'

defineProps<{
  showMobileMenu: boolean
  mobileMenuTitle: string
  mobileMenuView: string
  messageBadgeCountLabel: string
  badgeCountLabel: string
  ticketBadgeCountLabel: string
  messageConversations: ConversationSummary[]
  openRemindersList: Reminder[]
  openTicketsList: Ticket[]
}>()

const emit = defineEmits<{
  (event: 'toggle-mobile-menu'): void
  (event: 'set-mobile-menu-view', view: string): void
  (event: 'go-to-route', routeName: 'CustomerRegistration' | 'CustomerDirectory' | 'Register'): void
  (event: 'open-mobile-menu-panel', view: 'messages' | 'reminders' | 'tickets'): void
  (event: 'open-archived-conversations'): void
  (event: 'open-messages-page'): void
  (event: 'open-conversation', conversation: ConversationSummary): void
  (event: 'open-reminder', id: string): void
  (event: 'open-ticket', id: string): void
  (event: 'logout'): void
}>()

function formatDate(value?: string | null) {
  return formatLocalDateTime(value)
}
</script>

<style scoped>
.mobile-menu-wrap {
  position: relative;
}

.mobile-menu-btn {
  border: 1px solid rgba(142, 185, 229, 0.28);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(78, 137, 204, 0.28), rgba(16, 36, 58, 0.9));
  color: var(--color-ocean-mist);
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mobile-menu-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: min(92vw, 320px);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 16px;
  padding: 0.75rem;
  background: #fff;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
  z-index: 220;
}

.mobile-menu-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.7rem;
}

.mobile-menu-back {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-weight: 700;
}

.notification-item {
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

.conversation-unread-badge {
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

.notification-title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
  color: #0f172a;
}

.notification-meta {
  color: #64748b;
  font-size: 0.85rem;
  display: block;
  margin-top: 0.25rem;
}

.notifications-empty {
  color: #64748b;
  padding: 0.5rem 0;
}

.notification-item.archived-link {
  justify-content: center;
  font-weight: 700;
}

.notification-item:hover {
  border-color: #bfdbfe;
  background: #eef4ff;
}
</style>
