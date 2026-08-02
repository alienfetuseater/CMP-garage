<template>
  <main class="user-directory">
    <header class="directory-header">
      <div>
        <p class="eyebrow">Access Management</p>
        <h1>Registered Users</h1>
        <p>Review employee accounts and assigned access levels.</p>
      </div>
      <button v-if="canCreateUsers" type="button" @click="router.push({ name: 'Register' })">
        Add User
      </button>
    </header>

    <p v-if="loading" class="status">Loading registered users...</p>
    <p v-else-if="errorText" class="status error">{{ errorText }}</p>
    <p v-else-if="users.length === 0" class="status">No registered users found.</p>

    <div v-else class="user-table-wrap">
      <table class="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th v-if="canEditUsers" aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="user in users" :key="user.id">
            <tr :class="{ 'user-row-expanded': expandedUserId === user.id }">
              <template v-if="editingId === user.id">
                <td><input v-model.trim="editName" aria-label="User name" /></td>
                <td><input v-model.trim="editEmail" type="email" aria-label="User email" /></td>
                <td>
                  <select v-model="editRole" aria-label="User role">
                    <option v-for="role in userRoles" :key="role" :value="role">
                      {{ roleLabels[role] }}
                    </option>
                  </select>
                </td>
                <td class="actions">
                  <button
                    type="button"
                    class="primary"
                    :disabled="saving"
                    @click="saveUser(user.id)"
                  >
                    Save
                  </button>
                  <button type="button" class="secondary" :disabled="saving" @click="cancelEdit">
                    Cancel
                  </button>
                </td>
              </template>
              <template v-else>
                <td data-label="Name">
                  <button
                    type="button"
                    class="profile-toggle"
                    :aria-expanded="expandedUserId === user.id"
                    :aria-controls="`user-tickets-${user.id}`"
                    @click="toggleUserTickets(user.id)"
                  >
                    <strong>{{ user.name }}</strong>
                    <span aria-hidden="true">{{ expandedUserId === user.id ? '-' : '+' }}</span>
                  </button>
                </td>
                <td data-label="Email">{{ user.email }}</td>
                <td data-label="Role">
                  <span class="role-badge">{{ roleLabels[user.role] }}</span>
                </td>
                <td v-if="canEditUsers" class="actions">
                  <button type="button" class="secondary" @click="startEdit(user)">Edit</button>
                </td>
              </template>
            </tr>

            <tr
              v-if="expandedUserId === user.id"
              :id="`user-tickets-${user.id}`"
              class="ticket-detail-row"
            >
              <td :colspan="canEditUsers ? 4 : 3">
                <div class="ticket-detail">
                  <div class="ticket-detail-heading">
                    <strong>Assigned Tickets</strong>
                    <span>{{ assignedTickets[user.id]?.length ?? 0 }}</span>
                  </div>

                  <p v-if="loadingTicketsUserId === user.id" class="ticket-state">
                    Loading assigned tickets...
                  </p>
                  <p v-else-if="ticketErrors[user.id]" class="ticket-state error">
                    {{ ticketErrors[user.id] }}
                  </p>
                  <p v-else-if="assignedTickets[user.id]?.length === 0" class="ticket-state">
                    No tickets assigned to {{ user.name }}.
                  </p>
                  <div v-else class="assigned-ticket-list">
                    <button
                      v-for="ticket in assignedTickets[user.id]"
                      :key="ticket.id"
                      type="button"
                      class="assigned-ticket"
                      @click="openTicket(ticket.id)"
                    >
                      <span class="assigned-ticket-main">
                        <strong>{{ ticket.title }}</strong>
                        <small
                          >{{ categoryLabel(ticket.category) }} ·
                          {{ ticket.priority }} priority</small
                        >
                      </span>
                      <span class="assigned-ticket-meta">
                        <span class="ticket-status">{{ ticket.status }}</span>
                        <small>{{ formatLocalDateTime(ticket.scheduledDate) }}</small>
                      </span>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p v-if="successText" class="status success">{{ successText }}</p>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { AuthUser } from '@/stores/auth/state'
import { roleLabels, userRoles, type UserRole } from '@/domain/auth/permissions'
import { formatLocalDateTime } from '@/shared/datetime/format'
import {
  fetchUserAccess,
  fetchUserAssignedTickets,
  fetchUsers,
  updateUser,
  type UserAssignedTicket,
} from '@/services/users/accounts'

const router = useRouter()
const authStore = useAuthStore()
const users = ref<AuthUser[]>([])
const loading = ref(true)
const saving = ref(false)
const errorText = ref('')
const successText = ref('')
const editingId = ref('')
const editName = ref('')
const editEmail = ref('')
const editRole = ref<UserRole>('viewer')
const expandedUserId = ref('')
const loadingTicketsUserId = ref('')
const assignedTickets = ref<Record<string, UserAssignedTicket[]>>({})
const ticketErrors = ref<Record<string, string>>({})

const canCreateUsers = ref(false)
const canEditUsers = ref(false)

onMounted(loadUsers)

async function loadUsers() {
  loading.value = true
  errorText.value = ''
  try {
    const [access, registeredUsers] = await Promise.all([fetchUserAccess(), fetchUsers()])
    canCreateUsers.value = access.canCreate
    canEditUsers.value = access.canEdit
    users.value = registeredUsers
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    errorText.value = message.startsWith('403 ')
      ? 'Your account does not have permission to view registered users.'
      : message
  } finally {
    loading.value = false
  }
}

function startEdit(user: AuthUser) {
  editingId.value = user.id
  editName.value = user.name
  editEmail.value = user.email
  editRole.value = user.role
  errorText.value = ''
  successText.value = ''
}

function cancelEdit() {
  editingId.value = ''
}

async function toggleUserTickets(userId: string) {
  if (expandedUserId.value === userId) {
    expandedUserId.value = ''
    return
  }

  expandedUserId.value = userId
  if (Object.hasOwn(assignedTickets.value, userId)) return

  loadingTicketsUserId.value = userId
  ticketErrors.value[userId] = ''
  try {
    assignedTickets.value[userId] = await fetchUserAssignedTickets(userId)
  } catch (error) {
    ticketErrors.value[userId] = error instanceof Error ? error.message : String(error)
  } finally {
    if (loadingTicketsUserId.value === userId) loadingTicketsUserId.value = ''
  }
}

function categoryLabel(category: UserAssignedTicket['category']) {
  return `${category.charAt(0).toUpperCase()}${category.slice(1)}`
}

function openTicket(ticketId: string) {
  router.push({ name: 'Ticket', query: { id: ticketId } })
}

async function saveUser(id: string) {
  if (!editName.value || !editEmail.value) {
    errorText.value = 'Name and email are required.'
    return
  }

  saving.value = true
  errorText.value = ''
  successText.value = ''
  try {
    const updated = await updateUser(id, {
      name: editName.value,
      email: editEmail.value,
      role: editRole.value,
    })
    users.value = users.value.map((user) => (user.id === id ? updated : user))
    editingId.value = ''
    successText.value = `${updated.name}'s profile was updated.`
    if (authStore.user?.id === updated.id) authStore.user = updated
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : String(error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.user-directory {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;
}
.directory-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.directory-header h1 {
  margin: 0.15rem 0;
  color: #0f172a;
}
.directory-header p {
  margin: 0;
  color: #475569;
}
.eyebrow {
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #0369a1 !important;
}
.user-table-wrap {
  overflow-x: auto;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
}
.user-table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 0.85rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
}
th {
  background: #f8fafc;
  color: #334155;
  font-size: 0.78rem;
  text-transform: uppercase;
}
tbody tr:last-child td {
  border-bottom: 0;
}
input,
select {
  width: 100%;
  min-width: 150px;
  border: 1px solid #94a3b8;
  border-radius: 6px;
  padding: 0.55rem;
  font: inherit;
}
button {
  border: 1px solid #0369a1;
  border-radius: 6px;
  padding: 0.55rem 0.8rem;
  font-weight: 700;
  cursor: pointer;
}
.primary,
.directory-header button {
  background: #0369a1;
  color: #fff;
}
.secondary {
  background: #fff;
  color: #334155;
  border-color: #94a3b8;
}
.profile-toggle {
  width: 100%;
  border: 0;
  background: transparent;
  color: #0f172a;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  text-align: left;
}
.profile-toggle:hover,
.profile-toggle:focus-visible {
  color: #0369a1;
}
.user-row-expanded td {
  border-bottom-color: transparent;
}
.ticket-detail-row td {
  padding-top: 0;
  background: #f8fafc;
}
.ticket-detail {
  display: grid;
  gap: 0.65rem;
  border-left: 3px solid #0284c7;
  padding: 0.85rem 1rem;
}
.ticket-detail-heading,
.assigned-ticket {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.ticket-detail-heading span {
  color: #64748b;
  font-weight: 700;
}
.ticket-state {
  margin: 0;
}
.assigned-ticket-list {
  display: grid;
  gap: 0.5rem;
}
.assigned-ticket {
  width: 100%;
  border-color: #cbd5e1;
  background: #fff;
  color: #0f172a;
  text-align: left;
}
.assigned-ticket:hover,
.assigned-ticket:focus-visible {
  border-color: #0284c7;
  background: #f0f9ff;
}
.assigned-ticket-main,
.assigned-ticket-meta {
  display: grid;
  gap: 0.2rem;
}
.assigned-ticket-meta {
  justify-items: end;
}
.assigned-ticket small {
  color: #64748b;
}
.ticket-status {
  color: #075985;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: capitalize;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.45rem;
}
.role-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: #e0f2fe;
  color: #075985;
  font-weight: 700;
  font-size: 0.82rem;
}
.status {
  padding: 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  color: #334155;
}
.error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}
.success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}
@media (max-width: 700px) {
  .directory-header {
    align-items: stretch;
    flex-direction: column;
  }
  .user-table thead {
    display: none;
  }
  .user-table,
  .user-table tbody,
  .user-table tr,
  .user-table td {
    display: block;
    width: 100%;
  }
  .user-table tr {
    padding: 0.7rem;
    border-bottom: 1px solid #cbd5e1;
  }
  .user-table td {
    border: 0;
    padding: 0.35rem 0;
  }
  .actions {
    justify-content: flex-start;
  }
  .ticket-detail-row {
    padding: 0 !important;
  }
  .assigned-ticket {
    align-items: flex-start;
    flex-direction: column;
  }
  .assigned-ticket-meta {
    justify-items: start;
  }
}
</style>
