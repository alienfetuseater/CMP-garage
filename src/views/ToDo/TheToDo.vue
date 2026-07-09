<template>
  <main class="todo-page">
    <button class="back" @click="goBack">← Back</button>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <section v-else-if="todo">
      <h2>{{ todo.title }}</h2>
      <ul class="todo-details">
        <li><strong>ID:</strong> {{ todo.id }}</li>
        <li><strong>Due Date:</strong> {{ todo.dueDate }}</li>
        <li><strong>Completed:</strong> {{ todo.completed ? 'Yes' : 'No' }}</li>
        <li><strong>Related Type:</strong> {{ todo.relatedTo?.type }}</li>
        <li v-if="todo.relatedTo?.type === 'vessel'">
          <strong>Vessel:</strong>
          <span class="link" @click="openVessel">{{ vesselName || todo.relatedTo?.id }}</span>
        </li>
        <li v-else-if="todo.relatedTo?.type === 'customer'">
          <strong>Customer:</strong>
          <span class="link" @click="openOwner">{{ ownerName || todo.relatedTo?.id }}</span>
        </li>
        <li v-if="ownerId && todo.relatedTo?.type === 'vessel'">
          <strong>Owner:</strong>
          <span class="link" @click="openOwner">{{ ownerName || ownerId }}</span>
        </li>
      </ul>
    </section>
    <div v-else>No todo found.</div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Todo } from '@/types/mock'

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const todo = ref<Todo | null>(null)
    const loading = ref(true)
    const error = ref<string | null>(null)
    const vesselName = ref<string | null>(null)
    const vesselId = ref<string | null>(null)
    const ownerId = ref<string | null>(null)
    const ownerName = ref<string | null>(null)

    async function load() {
      loading.value = true
      try {
        const id = String(route.query.id || '')
        if (!id) throw new Error('No todo id provided')

        const res = await fetch('/mock/todos.json')
        if (!res.ok) throw new Error('Failed to load todos')
        const list: Todo[] = await res.json()
        todo.value = list.find((t) => t.id === id) ?? null

        // if related to vessel, load vessel and owner info; if related to customer, load customer info
        try {
          const related = todo.value?.relatedTo
          if (related) {
            // load customers (prefer localStorage)
            let customers: { id: string; name: string }[] = []
            const local = localStorage.getItem('mockCustomers')
            if (local) {
              try {
                customers = JSON.parse(local)
              } catch {
                customers = []
              }
            } else {
              const cres = await fetch('/mock/customers.json')
              if (cres.ok) customers = await cres.json()
            }

            if (related.type === 'vessel') {
              const vres = await fetch('/mock/vessels.json')
              if (vres.ok) {
                const map = await vres.json()
                const v = map[related.id]
                if (v) {
                  vesselId.value = v.id
                  vesselName.value = v.vesselName
                  ownerId.value = v.customerId ?? v.owner ?? null
                  if (ownerId.value) {
                    const c = customers.find((x) => x.id === ownerId.value)
                    ownerName.value = c ? c.name : ownerId.value
                  }
                }
              }
            } else if (related.type === 'customer') {
              const cid = related.id
              ownerId.value = cid
              const c = customers.find((x) => x.id === cid)
              ownerName.value = c ? c.name : cid
            }
          }
        } catch (metaErr) {
          console.warn('Failed to load metadata for todo', metaErr)
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err)
      } finally {
        loading.value = false
      }
    }

    function goBack() {
      router.back()
    }

    onMounted(load)

    function openVessel() {
      const vid = vesselId.value
      if (vid) router.push({ name: 'VesselProfile', query: { id: vid } })
    }

    function openOwner() {
      const cid = ownerId.value
      if (cid) router.push({ name: 'CustomerProfile', query: { id: cid } })
    }

    return {
      todo,
      loading,
      error,
      goBack,
      vesselName,
      vesselId,
      ownerId,
      ownerName,
      openVessel,
      openOwner,
    }
  },
})
</script>

<style scoped>
.todo-page {
  padding: 12px;
}
.back {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  margin-bottom: 12px;
}
.todo-details {
  list-style: none;
  padding: 0;
}
.todo-details li {
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}
.error {
  color: #b91c1c;
}
</style>
