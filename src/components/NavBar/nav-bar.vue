<template>
  <header class="top-nav">
    <div class="nav-shell">
      <nav>
        <ul>
          <li>
            <RouterLink to="/" class="home-link" title="Home">
              <img class="nav-logo" :src="logoSrc" alt="CMP Garage" />
            </RouterLink>
            <span class="brand-banner">Coastal Marine Pro</span>
          </li>
        </ul>
      </nav>

      <div class="nav-tools">
        <NavSearchPanel
          :search-query="searchQuery"
          :show-results="showResults"
          :has-any-results="hasAnyResults"
          :filtered-customers="filteredCustomers"
          :filtered-vessels="filteredVessels"
          :filtered-tickets="filteredTickets"
          @update:search-query="searchQuery = $event"
          @focus="showResults = true"
          @blur="onSearchBlur"
          @open-customer="openCustomer"
          @open-vessel="openVessel"
          @open-ticket="openTicket"
        />

        <div ref="mobileMenuWrapRef" class="mobile-menu-wrap" @click.stop>
          <MobileNavMenu
            :show-user-management="canManageUsers"
            :show-mobile-menu="showMobileMenu"
            :mobile-menu-title="mobileMenuTitle"
            :mobile-menu-view="mobileMenuView"
            :message-badge-count-label="messageBadgeCountLabel"
            :badge-count-label="badgeCountLabel"
            :ticket-badge-count-label="ticketBadgeCountLabel"
            :message-conversations="messageConversations"
            :open-reminders-list="openRemindersList"
            :open-tickets-list="openTicketsList"
            @toggle-mobile-menu="toggleMobileMenu"
            @set-mobile-menu-view="handleMobileMenuViewChange"
            @go-to-route="goToRoute"
            @open-mobile-menu-panel="openMobileMenuPanel"
            @open-archived-conversations="openArchivedConversations"
            @open-messages-page="openMessagesPage"
            @open-conversation="openConversationFromMobileMenu"
            @open-reminder="openReminderFromMobileMenu"
            @open-ticket="openTicketFromMobileMenu"
            @logout="handleLogout"
          />
        </div>

        <div class="action-icons">
          <NavActionControl v-if="canManageUsers" to="/register" :ariaLabel="'User Registration'" title="User Registration">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M15 19.5a6.5 6.5 0 0 0-13 0" />
              <path d="M8.5 12.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" />
              <path d="M18 8v7" />
              <path d="M14.5 11.5h7" />
            </svg>
          </NavActionControl>

          <NavActionControl
            v-if="canManageUsers"
            to="/users"
            :ariaLabel="'Registered Users'"
            title="Registered Users"
            label="Users"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M8 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M2.5 20a5.5 5.5 0 0 1 11 0" />
              <path d="M16 7h5M16 11h5M16 15h5" />
            </svg>
          </NavActionControl>

          <NavActionControl :ariaLabel="'Logout'" title="Logout" @click="handleLogout">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M14 7V4.5A1.5 1.5 0 0 0 12.5 3h-7A1.5 1.5 0 0 0 4 4.5v15A1.5 1.5 0 0 0 5.5 21h7a1.5 1.5 0 0 0 1.5-1.5V17"
              />
              <path d="M10 12h10" />
              <path d="m16.5 8.5 3.5 3.5-3.5 3.5" />
            </svg>
          </NavActionControl>

          <NavActionControl
            to="/CustomerRegistration"
            :ariaLabel="'New Client'"
            title="New Client Registration"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 12.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" />
              <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
            </svg>
          </NavActionControl>

          <NavActionControl to="/CustomerDirectory" :ariaLabel="'Client Directory'" title="Directory">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6 4.5h10.5A2.5 2.5 0 0 1 19 7v11.5a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 1 3.5 13.5V7A2.5 2.5 0 0 1 6 4.5Z"
              />
              <path d="M8 7.5h7.5M8 11h7.5" />
            </svg>
          </NavActionControl>

          <div ref="messageWrapRef" class="notifications-wrap">
            <button
              class="notify-btn"
              type="button"
              aria-label="Open team messages"
              title="Team Messages"
              @click="toggleMessagePopup"
            >
              <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M4.5 6.5A2.5 2.5 0 0 1 7 4h10a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 17 15H10l-4.5 4v-4H7A2.5 2.5 0 0 1 4.5 12.5Z"
                />
              </svg>
              <span v-if="unreadMessageCount > 0" class="notify-count">{{
                messageBadgeCountLabel
              }}</span>
            </button>

            <NavbarNotificationPopover
              v-if="showMessagesPopup"
              title="Team Messages"
              :count="unreadConversationCount"
              close-label="Close messages popup"
              @close="closeMessagePopup"
            >
              <button
                type="button"
                class="notification-item archived-link"
                @mousedown.prevent
                @click="openMessagesPage"
              >
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
                  :class="{ 'notification-item-unread': conversation.hasUnread }"
                  @mousedown.prevent
                  @click="openConversationFromBell(conversation)"
                >
                  <span class="notification-title">
                    {{ conversation.title }}
                    <span v-if="conversation.unreadCount > 0" class="conversation-unread-badge">
                      {{ conversation.unreadCount }}
                    </span>
                  </span>
                  <span class="notification-meta">
                    {{ conversation.subtitle }} ·
                    {{ conversation.partnerNames.join(', ') || 'Conversation' }} ·
                    {{ formatLocalDateTime(conversation.lastMessageAt) }}
                  </span>
                </button>
              </template>

              <button
                type="button"
                class="notification-item archived-link"
                @mousedown.prevent
                @click="openArchivedConversations"
              >
                Open Archived Conversations
              </button>
            </NavbarNotificationPopover>
          </div>

          <div ref="reminderWrapRef" class="notifications-wrap">
            <button
              class="notify-btn"
              type="button"
              aria-label="Open reminders"
              title="Open Reminders"
              @click="toggleReminderPopup"
            >
              <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M12 4a4 4 0 0 0-4 4v2.2c0 .8-.2 1.5-.6 2.1L6 13.7V16h12v-2.3l-1.4-1.4c-.4-.6-.6-1.3-.6-2.1V8a4 4 0 0 0-4-4Z"
                />
                <path d="M9.5 16a2.5 2.5 0 0 0 5 0" />
              </svg>
              <span v-if="openReminderCount > 0" class="notify-count">{{ badgeCountLabel }}</span>
            </button>

            <NavbarNotificationPopover
              v-if="showNotifications"
              title="Open Reminders"
              :count="openReminderCount"
              close-label="Close reminders popup"
              @close="closeReminderPopup"
            >
              <div v-if="openRemindersList.length === 0" class="notifications-empty">
                No open reminders.
              </div>

              <button
                v-for="reminder in openRemindersList"
                v-else
                :key="reminder.id"
                type="button"
                class="notification-item"
                @mousedown.prevent
                @click="openReminderFromBell(reminder.id)"
              >
                <span class="notification-title">{{ reminder.title }}</span>
                <span class="notification-meta">{{ formatLocalDateTime(reminder.dueDate) }}</span>
              </button>
            </NavbarNotificationPopover>
          </div>

          <div ref="ticketWrapRef" class="notifications-wrap">
            <button
              class="notify-btn"
              type="button"
              aria-label="Open tickets"
              title="Open Tickets"
              @click="toggleTicketPopup"
            >
              <svg
                class="nav-icon ticket-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M4.5 7.5h15a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 0 0 3v2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16v-2a1.5 1.5 0 0 0 0-3V9a1.5 1.5 0 0 1 1.5-1.5Z"
                />
                <path d="M8 10.5h8M8 13.5h8" />
              </svg>
              <span v-if="openTicketCount > 0" class="notify-count">{{
                ticketBadgeCountLabel
              }}</span>
            </button>

            <NavbarNotificationPopover
              v-if="showTicketsPopup"
              title="Open Tickets"
              :count="openTicketCount"
              close-label="Close tickets popup"
              @close="closeTicketPopup"
            >
              <div v-if="openTicketsList.length === 0" class="notifications-empty">
                No open tickets.
              </div>

              <button
                v-for="ticket in openTicketsList"
                v-else
                :key="ticket.id"
                type="button"
                class="notification-item"
                @mousedown.prevent
                @click="openTicketFromBell(ticket.id)"
              >
                <span class="notification-title">{{ ticket.service_title }}</span>
                <span class="notification-meta"
                  >{{ ticket.status }} · {{ ticket.priority }} ·
                  {{ formatLocalDateTime(ticket.scheduledDate) }}</span
                >
              </button>
            </NavbarNotificationPopover>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customers'
import { useVesselStore } from '@/stores/vessels'
import { useTicketStore } from '@/stores/tickets'
import { useReminderStore } from '@/stores/reminders'
import { useAuthStore } from '@/stores/auth'
import type { ConversationSummary } from '@/types/mock'
import { formatLocalDateTime } from '@/shared/datetime/format'
import { buildConversationSummary } from '@/domain/conversations/utils'
import { fetchUserAccess } from '@/services/users/accounts'
import { reminderSortKey, isTicketOpen, toBadgeCountLabel } from '@/domain/navbar/activity'
import { useNavbarSearch } from '@/composables/navbar/useNavbarSearch'
import { useNavbarOverlays } from '@/composables/navbar/useNavbarOverlays'
import NavSearchPanel from '@/components/NavBar/NavSearchPanel.vue'
import MobileNavMenu from '@/components/NavBar/MobileNavMenu.vue'
import NavbarNotificationPopover from '@/components/NavBar/NavbarNotificationPopover.vue'
import NavActionControl from '@/components/NavBar/NavActionControl.vue'

type MobileMenuView = 'menu' | 'messages' | 'reminders' | 'tickets'

const router = useRouter()
const logoSrc = '/CMPicon.png'
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
const ticketStore = useTicketStore()
const reminderStore = useReminderStore()
const authStore = useAuthStore()
const canManageUsers = ref(false)

async function refreshUserAccess() {
  try {
    const access = await fetchUserAccess()
    canManageUsers.value = access.canRead
  } catch {
    canManageUsers.value = false
  }
}

onMounted(() => {
  void refreshUserAccess()
  window.addEventListener('focus', refreshUserAccess)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', refreshUserAccess)
})

const {
  searchQuery,
  showResults,
  filteredCustomers,
  filteredVessels,
  filteredTickets,
  hasAnyResults,
  closeSearch,
  onSearchBlur,
} = useNavbarSearch({
  customers: () => customerStore.customers,
  vessels: () => vesselStore.vessels,
  tickets: () => ticketStore.tickets,
})

const {
  showMessagesPopup,
  showNotifications,
  showTicketsPopup,
  showMobileMenu,
  mobileMenuView,
  mobileMenuTitle,
  messageWrapRef,
  reminderWrapRef,
  ticketWrapRef,
  mobileMenuWrapRef,
  toggleReminderPopup,
  toggleMessagePopup,
  toggleTicketPopup,
  toggleMobileMenu,
  openMobileMenuPanel,
  closeMessagePopup,
  closeReminderPopup,
  closeTicketPopup,
  closeAllPopups,
  closeMobileMenu,
} = useNavbarOverlays()

const openRemindersList = computed(() =>
  reminderStore.reminders
    .filter((reminder) => !reminder.completed)
    .slice()
    .sort((a, b) => reminderSortKey(a.dueDate) - reminderSortKey(b.dueDate))
    .slice(0, 8),
)

const openTicketsList = computed(() =>
  ticketStore.tickets
    .filter((ticket) => isTicketOpen(ticket.status))
    .slice()
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 8),
)

const allMessageConversations = computed<ConversationSummary[]>(() => {
  const currentUserId = String(authStore.user?.id || '')

  return [
    ...ticketStore.tickets
      .map((ticket) => buildConversationSummary('ticket', ticket, currentUserId))
      .filter((entry): entry is ConversationSummary => Boolean(entry)),
    ...reminderStore.reminders
      .map((reminder) => buildConversationSummary('reminder', reminder, currentUserId))
      .filter((entry): entry is ConversationSummary => Boolean(entry)),
  ].sort(
    (left, right) =>
      Number(right.hasUnread) - Number(left.hasUnread) ||
      new Date(right.lastMessageAt || 0).getTime() - new Date(left.lastMessageAt || 0).getTime(),
  )
})

const messageConversations = computed<ConversationSummary[]>(() =>
  allMessageConversations.value.slice(0, 8),
)

const unreadMessageCount = computed(() =>
  allMessageConversations.value.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  ),
)

const unreadConversationCount = computed(
  () => allMessageConversations.value.filter((conversation) => conversation.hasUnread).length,
)

const openReminderCount = computed(
  () => reminderStore.reminders.filter((reminder) => !reminder.completed).length,
)

const openTicketCount = computed(
  () => ticketStore.tickets.filter((ticket) => isTicketOpen(ticket.status)).length,
)

const badgeCountLabel = computed(() => toBadgeCountLabel(openReminderCount.value))

const ticketBadgeCountLabel = computed(() => toBadgeCountLabel(openTicketCount.value))

const messageBadgeCountLabel = computed(() => toBadgeCountLabel(unreadMessageCount.value))

function handleMobileMenuViewChange(nextView: string) {
  mobileMenuView.value = nextView as MobileMenuView
}

function openCustomer(id: string) {
  closeSearch()
  router.push({ name: 'CustomerProfile', query: { id } })
}

function openVessel(id: string) {
  closeSearch()
  router.push({ name: 'VesselProfile', query: { id } })
}

function openTicket(id: string) {
  closeSearch()
  router.push({ name: 'Ticket', query: { id } })
}

function openConversationFromBell(conversation: ConversationSummary) {
  showMessagesPopup.value = false
  router.push({
    name: 'Conversation',
    query: { type: conversation.type, id: conversation.entityId },
  })
}

function openArchivedConversations() {
  closeAllPopups()
  closeMobileMenu()
  router.push({ name: 'ArchivedMessages' })
}

function openReminderFromBell(id: string) {
  showNotifications.value = false
  router.push({ name: 'Reminder', query: { id } })
}

function openTicketFromBell(id: string) {
  showTicketsPopup.value = false
  router.push({ name: 'Ticket', query: { id } })
}

function openReminderFromMobileMenu(id: string) {
  closeMobileMenu()
  router.push({ name: 'Reminder', query: { id } })
}

function openConversationFromMobileMenu(conversation: ConversationSummary) {
  closeMobileMenu()
  router.push({
    name: 'Conversation',
    query: { type: conversation.type, id: conversation.entityId },
  })
}

function openMessagesPage() {
  closeAllPopups()
  closeMobileMenu()
  router.push({ name: 'Messages' })
}

function openTicketFromMobileMenu(id: string) {
  closeMobileMenu()
  router.push({ name: 'Ticket', query: { id } })
}

function goToRoute(name: 'CustomerRegistration' | 'CustomerDirectory' | 'Register' | 'UserDirectory') {
  closeMobileMenu()
  router.push({ name })
}

function handleLogout() {
  closeSearch()
  closeAllPopups()
  closeMobileMenu()
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background-color: var(--color-navbar);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
  border-radius: 0 0 10px 10px;
}

.nav-shell {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0.4rem 1.15rem 0.3rem 0.85rem;
  display: grid;
  grid-template-columns: auto minmax(340px, 560px);
  align-items: center;
  gap: 0.85rem;
}

.nav-tools {
  width: 100%;
  max-width: 100%;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-wrap {
  flex: 1 1 340px;
  min-width: 280px;
  max-width: 500px;
}

.action-icons {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  margin-right: 0;
}

nav {
  width: fit-content;
  display: flex;
  align-items: center;
}

ul {
  list-style: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
  padding: 0;
  gap: 0.35rem;
}

li {
  flex: 0 1 auto;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.home-link {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 0;
  padding: 0;
}

.nav-logo {
  display: block;
  width: 64px;
  height: 64px;
  object-fit: contain;
  transition: transform 0.18s ease;
}

.nav-logo:hover {
  transform: scale(1.06);
}

.brand-banner {
  display: inline-flex;
  align-items: center;
  padding: 0.46rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(142, 185, 229, 0.38);
  background: linear-gradient(180deg, rgba(78, 137, 204, 0.3), rgba(16, 36, 58, 0.9));
  color: #f4fbff;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
}

.nav-icon-link {
  position: relative;
  width: 42px;
  height: 42px;
  padding: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(142, 185, 229, 0.28);
  background: linear-gradient(180deg, rgba(78, 137, 204, 0.28), rgba(16, 36, 58, 0.9));
  color: var(--color-ocean-mist);
  transition:
    background 0.2s ease,
    transform 0.18s ease,
    color 0.2s ease;
}

.nav-icon-link:hover,
.nav-icon-link.router-link-active {
  background: linear-gradient(180deg, rgba(142, 185, 229, 0.38), rgba(78, 137, 204, 0.72));
  color: #f4fbff;
  transform: translateY(-1px);
}

.nav-icon {
  width: 1.05rem;
  height: 1.05rem;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
  line-height: 1;
}

.ticket-icon {
  stroke-width: 1.75;
}

.notification-item-unread {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.conversation-unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  margin-left: 8px;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.78rem;
  font-weight: 700;
}

a,
:deep(a) {
  display: block;
  color: var(--color-navbar-text);
  text-decoration: none;
  padding: 0.35rem 0.75rem 0.55rem;
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

.home-link,
:deep(.home-link) {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  position: relative;
  top: 4px;
}

.home-link.router-link-active,
:deep(.home-link.router-link-active) {
  background-color: transparent;
  color: inherit;
}

.search-wrap,
.notifications-wrap,
.mobile-menu-wrap {
  position: relative;
}

.mobile-menu-wrap {
  display: none;
}

.search-input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-navbar-text);
  padding: 0.56rem 0.9rem;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.72);
}

.search-input:focus {
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.16);
}

.search-results,
.notifications-popup {
  position: absolute;
  right: 0;
  top: calc(100% + 0.45rem);
  max-height: 70vh;
  overflow: auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 20px 36px rgba(15, 23, 42, 0.18);
  z-index: 30;
  padding: 0.5rem;
}

.search-results {
  width: min(100vw - 2rem, 460px);
}

.notifications-popup {
  width: min(100vw - 2rem, 340px);
}

.search-group {
  display: grid;
  gap: 0.3rem;
}

.search-group + .search-group {
  margin-top: 0.45rem;
  padding-top: 0.45rem;
  border-top: 1px solid #edf2f7;
}

.search-group h4 {
  margin: 0;
  font-size: 0.77rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  padding: 0 0.25rem;
}

.search-item,
.notification-item {
  border: none;
  width: 100%;
  text-align: left;
  background: #f8fafc;
  border-radius: 10px;
  padding: 0.5rem 0.65rem;
  cursor: pointer;
  display: grid;
  gap: 0.2rem;
}

.search-item:hover,
.notification-item:hover {
  background: #eff6ff;
}

.result-title,
.notification-title {
  font-weight: 700;
  color: #0f172a;
}

.result-meta,
.notification-meta {
  font-size: 0.82rem;
  color: #475569;
}

.search-empty,
.notifications-empty {
  padding: 0.5rem 0.6rem;
  color: #64748b;
}

.notify-btn {
  position: relative;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(78, 137, 204, 0.24), rgba(16, 36, 58, 0.9));
  color: var(--color-ocean-mist);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.notify-btn:hover {
  background: linear-gradient(180deg, rgba(142, 185, 229, 0.34), rgba(46, 95, 157, 0.82));
}

.notify-count {
  position: absolute;
  top: -5px;
  right: -4px;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--color-ocean-bright), var(--color-ocean-mid));
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(215, 232, 246, 0.9);
}

.notifications-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.4rem 0.5rem;
  border-bottom: 1px solid #edf2f7;
  margin-bottom: 0.35rem;
  color: #0f172a;
}

.notifications-title {
  line-height: 1;
}

.notifications-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.notifications-total {
  display: inline-flex;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 700;
}

.popup-close-btn {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 999px;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.popup-close-btn:hover {
  background: #f1f5f9;
}

.notification-item + .notification-item {
  margin-top: 0.3rem;
}

.mobile-menu-btn,
.mobile-menu-back {
  color: var(--color-navbar-text);
}

.mobile-menu-btn {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-dropdown {
  position: absolute;
  top: calc(100% + 0.45rem);
  right: 0;
  width: min(100vw - 1.5rem, 320px);
  max-height: 70vh;
  overflow: auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 20px 36px rgba(15, 23, 42, 0.18);
  z-index: 35;
  padding: 0.55rem;
}

.mobile-menu-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.25rem 0.25rem 0.55rem;
  border-bottom: 1px solid #edf2f7;
  color: #0f172a;
}

.mobile-menu-list,
.mobile-menu-panel {
  display: grid;
  gap: 0.35rem;
  padding-top: 0.45rem;
}

.mobile-menu-item {
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  text-align: left;
  background: #f8fafc;
  color: #0f172a;
}

.mobile-menu-item:hover {
  background: #eff6ff;
}

.nav-logout-btn {
  cursor: pointer;
}

.mobile-menu-count {
  display: inline-flex;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .nav-shell {
    grid-template-columns: 1fr;
    padding-inline: 1rem;
  }

  .nav-tools {
    justify-self: stretch;
  }

  ul {
    overflow: auto;
    white-space: nowrap;
    padding-bottom: 0.2rem;
  }

  li {
    flex: 0 0 auto;
  }

  .search-results {
    width: min(100vw - 2rem, 640px);
    left: 0;
    right: auto;
  }
}

@media (max-width: 720px) {
  .top-nav {
    border-radius: 0;
  }

  .nav-shell {
    grid-template-columns: auto minmax(0, 1fr);
    padding: 0.75rem;
    gap: 0.75rem;
    align-items: center;
  }

  .nav-tools {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.75rem;
  }

  .search-wrap {
    flex: 1 1 auto;
    min-width: 0;
    max-width: none;
  }

  .mobile-menu-wrap {
    display: block;
  }

  .action-icons {
    display: none;
  }

  .home-link {
    padding: 0;
    top: 0;
  }

  .nav-logo {
    width: 52px;
    height: 52px;
  }

  .brand-banner {
    display: none;
  }

  .search-input {
    padding: 0.7rem 0.9rem;
  }

  .search-results,
  .notifications-popup,
  .mobile-menu-dropdown {
    left: 0;
    right: 0;
    width: 100%;
  }

  .mobile-menu-dropdown {
    position: fixed;
    top: 4.75rem;
    left: 0.75rem;
    right: 0.75rem;
    width: auto;
    max-height: calc(100vh - 6rem);
  }
}

@media (max-width: 480px) {
  .nav-shell {
    padding-inline: 0.6rem;
  }

  .mobile-menu-btn {
    width: 40px;
    height: 40px;
  }

  .mobile-menu-dropdown {
    top: 4.35rem;
    left: 0.5rem;
    right: 0.5rem;
  }

  .search-input {
    padding-inline: 0.75rem;
  }
}
</style>
