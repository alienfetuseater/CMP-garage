<template>
  <header class="top-nav">
    <div class="nav-shell">
      <nav>
        <ul>
          <li>
            <RouterLink to="/" class="home-link" title="Home">
              <img class="nav-logo" src="/CMPicon.png" alt="CMP Garage" />
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="nav-tools">
        <div class="search-wrap" @focusin="showResults = true" @focusout="onSearchBlur">
          <input
            v-model="searchQuery"
            class="search-input"
            type="search"
            placeholder="Search customers, vessels, or tickets"
            aria-label="Search customers, vessels, or tickets"
            @focus="showResults = true"
          />

          <div v-if="showResults && searchQuery.trim()" class="search-results">
            <div v-if="!hasAnyResults" class="search-empty">No matches found.</div>

            <section v-if="filteredCustomers.length" class="search-group">
              <h4>Customers</h4>
              <button
                v-for="customer in filteredCustomers"
                :key="customer.id"
                type="button"
                class="search-item"
                @mousedown.prevent
                @click="openCustomer(customer.id)"
              >
                <span class="result-title">{{ customer.name }}</span>
                <span class="result-meta">{{ customer.phone }} · {{ customer.email }}</span>
              </button>
            </section>

            <section v-if="filteredVessels.length" class="search-group">
              <h4>Vessels</h4>
              <button
                v-for="vessel in filteredVessels"
                :key="vessel.id"
                type="button"
                class="search-item"
                @mousedown.prevent
                @click="openVessel(vessel.id)"
              >
                <span class="result-title">{{ vessel.vesselName }}</span>
                <span class="result-meta"
                  >{{ vessel.vesselMake }} ({{ vessel.vesselYear }}) ·
                  {{ vessel.customerName }}</span
                >
              </button>
            </section>

            <section v-if="filteredTickets.length" class="search-group">
              <h4>Tickets</h4>
              <button
                v-for="ticket in filteredTickets"
                :key="ticket.id"
                type="button"
                class="search-item"
                @mousedown.prevent
                @click="openTicket(ticket.id)"
              >
                <span class="result-title">{{ ticket.service_title }}</span>
                <span class="result-meta"
                  >{{ ticket.status }} · {{ ticket.priority }} ·
                  {{ ticket.customerName || 'Customer' }}</span
                >
              </button>
            </section>
          </div>
        </div>

        <div class="action-icons">
          <RouterLink
            to="/CustomerRegistration"
            class="nav-icon-link"
            aria-label="New Client"
            title="New Client Registration"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 12.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" />
              <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
            </svg>
          </RouterLink>

          <RouterLink
            to="/CustomerDirectory"
            class="nav-icon-link"
            aria-label="Client Directory"
            title="Directory"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6 4.5h10.5A2.5 2.5 0 0 1 19 7v11.5a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 1 3.5 13.5V7A2.5 2.5 0 0 1 6 4.5Z"
              />
              <path d="M8 7.5h7.5M8 11h7.5" />
            </svg>
          </RouterLink>

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

            <div v-if="showNotifications" class="notifications-popup">
              <div class="notifications-head">
                <strong class="notifications-title">Open Reminders</strong>
                <div class="notifications-actions">
                  <span class="notifications-total">{{ openReminderCount }}</span>
                  <button
                    type="button"
                    class="popup-close-btn"
                    aria-label="Close reminders popup"
                    @click="closeReminderPopup"
                  >
                    X
                  </button>
                </div>
              </div>

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
            </div>
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

            <div v-if="showTicketsPopup" class="notifications-popup">
              <div class="notifications-head">
                <strong class="notifications-title">Open Tickets</strong>
                <div class="notifications-actions">
                  <span class="notifications-total">{{ openTicketCount }}</span>
                  <button
                    type="button"
                    class="popup-close-btn"
                    aria-label="Close tickets popup"
                    @click="closeTicketPopup"
                  >
                    X
                  </button>
                </div>
              </div>

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
            </div>
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
import { formatLocalDateTime } from '@/utils/datetime'

const router = useRouter()
const customerStore = useCustomerStore()
const vesselStore = useVesselStore()
const ticketStore = useTicketStore()
const reminderStore = useReminderStore()

const searchQuery = ref('')
const showResults = ref(false)
const showNotifications = ref(false)
const showTicketsPopup = ref(false)
const reminderWrapRef = ref<HTMLElement | null>(null)
const ticketWrapRef = ref<HTMLElement | null>(null)

const normalize = (value: string) => value.trim().toLowerCase()

const filteredCustomers = computed(() => {
  const q = normalize(searchQuery.value)
  if (!q) return []

  return customerStore.customers
    .filter((customer) => {
      const name = normalize(customer.name || '')
      const phone = normalize(customer.phone || '')
      const email = normalize(customer.email || '')
      return name.includes(q) || phone.includes(q) || email.includes(q)
    })
    .slice(0, 6)
})

const filteredVessels = computed(() => {
  const q = normalize(searchQuery.value)
  if (!q) return []

  return vesselStore.vessels
    .filter((vessel) => {
      const vesselName = normalize(vessel.vesselName || '')
      const make = normalize(vessel.vesselMake || '')
      const owner = normalize(vessel.customerName || '')
      const year = String(vessel.vesselYear || '')
      return vesselName.includes(q) || make.includes(q) || owner.includes(q) || year.includes(q)
    })
    .slice(0, 6)
})

const filteredTickets = computed(() => {
  const q = normalize(searchQuery.value)
  if (!q) return []

  return ticketStore.tickets
    .filter((ticket) => {
      const title = normalize(ticket.service_title || '')
      const category = normalize(ticket.service_category || '')
      const status = normalize(ticket.status || '')
      const priority = normalize(ticket.priority || '')
      const customer = normalize(ticket.customerName || '')
      const vessel = normalize(ticket.vesselName || '')
      const id = normalize(ticket.id || '')
      return (
        title.includes(q) ||
        category.includes(q) ||
        status.includes(q) ||
        priority.includes(q) ||
        customer.includes(q) ||
        vessel.includes(q) ||
        id.includes(q)
      )
    })
    .slice(0, 6)
})

const hasAnyResults = computed(
  () =>
    filteredCustomers.value.length > 0 ||
    filteredVessels.value.length > 0 ||
    filteredTickets.value.length > 0,
)

function reminderSortKey(dueDate?: string) {
  if (!dueDate) return Number.POSITIVE_INFINITY

  const timestamp = new Date(dueDate).getTime()
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp
}

const openRemindersList = computed(() =>
  reminderStore.reminders
    .filter((reminder) => !reminder.completed)
    .slice()
    .sort((a, b) => reminderSortKey(a.dueDate) - reminderSortKey(b.dueDate))
    .slice(0, 8),
)

function isTicketOpen(status?: string) {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
  return normalized !== 'closed' && normalized !== 'completed' && normalized !== 'cancelled'
}

const openTicketsList = computed(() =>
  ticketStore.tickets
    .filter((ticket) => isTicketOpen(ticket.status))
    .slice()
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 8),
)

const openReminderCount = computed(
  () => reminderStore.reminders.filter((reminder) => !reminder.completed).length,
)

const openTicketCount = computed(
  () => ticketStore.tickets.filter((ticket) => isTicketOpen(ticket.status)).length,
)

const badgeCountLabel = computed(() =>
  openReminderCount.value > 99 ? '99+' : String(openReminderCount.value),
)

const ticketBadgeCountLabel = computed(() =>
  openTicketCount.value > 99 ? '99+' : String(openTicketCount.value),
)

function closeSearch() {
  searchQuery.value = ''
  showResults.value = false
}

function onSearchBlur() {
  window.setTimeout(() => {
    showResults.value = false
  }, 120)
}

function toggleReminderPopup() {
  const nextState = !showNotifications.value
  showTicketsPopup.value = false
  showNotifications.value = nextState
}

function toggleTicketPopup() {
  const nextState = !showTicketsPopup.value
  showNotifications.value = false
  showTicketsPopup.value = nextState
}

function closeReminderPopup() {
  showNotifications.value = false
}

function closeTicketPopup() {
  showTicketsPopup.value = false
}

function closeAllPopups() {
  showNotifications.value = false
  showTicketsPopup.value = false
}

function onDocumentClick(event: MouseEvent) {
  const targetNode = event.target as Node | null
  if (!targetNode) return

  const inReminderWrap = reminderWrapRef.value?.contains(targetNode) ?? false
  const inTicketWrap = ticketWrapRef.value?.contains(targetNode) ?? false
  if (!inReminderWrap && !inTicketWrap) {
    closeAllPopups()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})

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

function openReminderFromBell(id: string) {
  showNotifications.value = false
  router.push({ name: 'Reminder', query: { id } })
}

function openTicketFromBell(id: string) {
  showTicketsPopup.value = false
  router.push({ name: 'Ticket', query: { id } })
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
  border-radius: 7px;
}

.nav-shell {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0.4rem 1.15rem 0.3rem 0.85rem;
  display: grid;
  grid-template-columns: auto minmax(320px, 520px);
  align-items: center;
  gap: 0.85rem;
}

.nav-tools {
  width: 100%;
  max-width: 500px;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-wrap {
  flex: 1 1 320px;
  min-width: 240px;
  max-width: 380px;
}

.action-icons {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 16px;
  margin-right: 2.75rem;
}

nav {
  width: fit-content;
  display: flex;
  align-items: flex-end;
}

ul {
  list-style: none;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  margin: 0;
  padding: 0;
  gap: 0.35rem;
}

li {
  flex: 0 1 auto;
  text-align: center;
  display: flex;
  align-items: flex-end;
}

.home-link {
  display: inline-flex;
  align-items: flex-end;
  justify-content: flex-start;
  margin-left: 0;
  padding: 0.05rem 0 0.35rem;
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

.home-link.router-link-active,
:deep(.home-link.router-link-active) {
  background-color: transparent;
  color: inherit;
}

.search-wrap,
.notifications-wrap {
  position: relative;
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

@media (max-width: 1100px) {
  .nav-shell {
    grid-template-columns: 1fr;
  }

  .nav-tools {
    grid-template-columns: 1fr auto;
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
</style>
