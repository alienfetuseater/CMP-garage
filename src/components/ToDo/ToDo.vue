<template>
  <div class="todo-popup-backdrop" @click.self="close">
    <section class="todo-popup">
      <header class="todo-popup-header">
        <h3>Todos for {{ date }}</h3>
        <button class="close-btn" @click="close">✕</button>
      </header>

      <ul>
        <li
          v-for="todo in todos"
          :key="todo.id"
          class="todo-item clickable"
          @click="openTodo(todo.id)"
        >
          <div class="todo-title">{{ todo.title }}</div>
          <div class="todo-meta">
            <span>{{ todo.date }}</span>
            <span>{{ todo.status }}</span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useRouter } from 'vue-router'
import type { TodoDisplayItem } from '@/types/mock'

export default defineComponent({
  props: {
    date: {
      type: String,
      required: true,
    },
    todos: {
      type: Array as PropType<TodoDisplayItem[]>,
      required: true,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const router = useRouter()

    function close() {
      emit('close')
    }

    function openTodo(id: string) {
      if (!id) return
      router.push({ name: 'ToDo', query: { id } })
      emit('close')
    }

    return {
      close,
      openTodo,
      props,
    }
  },
})
</script>

<style scoped>
.todo-popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.todo-popup {
  width: min(90vw, 420px);
  max-height: 80vh;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.15);
}

.todo-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  font-weight: 700;
}

.todo-item {
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
  cursor: default;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-title {
  font-weight: 600;
}

.todo-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}
.clickable {
  cursor: pointer;
}
</style>
