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
          <tr v-for="user in users" :key="user.id">
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
                <button type="button" class="primary" :disabled="saving" @click="saveUser(user.id)">
                  Save
                </button>
                <button type="button" class="secondary" :disabled="saving" @click="cancelEdit">
                  Cancel
                </button>
              </td>
            </template>
            <template v-else>
              <td data-label="Name"><strong>{{ user.name }}</strong></td>
              <td data-label="Email">{{ user.email }}</td>
              <td data-label="Role"><span class="role-badge">{{ roleLabels[user.role] }}</span></td>
              <td v-if="canEditUsers" class="actions">
                <button type="button" class="secondary" @click="startEdit(user)">Edit</button>
              </td>
            </template>
          </tr>
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
import { fetchUserAccess, fetchUsers, updateUser } from '@/services/users/accounts'

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
.user-directory { max-width: 1100px; margin: 0 auto; padding: 1rem; }
.directory-header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
.directory-header h1 { margin: 0.15rem 0; color: #0f172a; }
.directory-header p { margin: 0; color: #475569; }
.eyebrow { font-size: 0.78rem; font-weight: 800; text-transform: uppercase; color: #0369a1 !important; }
.user-table-wrap { overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
.user-table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.85rem; border-bottom: 1px solid #e2e8f0; text-align: left; vertical-align: middle; }
th { background: #f8fafc; color: #334155; font-size: 0.78rem; text-transform: uppercase; }
tbody tr:last-child td { border-bottom: 0; }
input, select { width: 100%; min-width: 150px; border: 1px solid #94a3b8; border-radius: 6px; padding: 0.55rem; font: inherit; }
button { border: 1px solid #0369a1; border-radius: 6px; padding: 0.55rem 0.8rem; font-weight: 700; cursor: pointer; }
.primary, .directory-header button { background: #0369a1; color: #fff; }
.secondary { background: #fff; color: #334155; border-color: #94a3b8; }
.actions { display: flex; justify-content: flex-end; gap: 0.45rem; }
.role-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 6px; background: #e0f2fe; color: #075985; font-weight: 700; font-size: 0.82rem; }
.status { padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; color: #334155; }
.error { border-color: #fecaca; background: #fef2f2; color: #b91c1c; }
.success { border-color: #bbf7d0; background: #f0fdf4; color: #166534; }
@media (max-width: 700px) {
  .directory-header { align-items: stretch; flex-direction: column; }
  .user-table thead { display: none; }
  .user-table, .user-table tbody, .user-table tr, .user-table td { display: block; width: 100%; }
  .user-table tr { padding: 0.7rem; border-bottom: 1px solid #cbd5e1; }
  .user-table td { border: 0; padding: 0.35rem 0; }
  .actions { justify-content: flex-start; }
}
</style>