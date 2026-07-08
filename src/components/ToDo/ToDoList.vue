<template>
  <section class="todo-list-panel">
    <h3>Todo List</h3>
    <ul>
      <li
        v-for="todo in todos"
        :key="todo.id"
        :class="[{ completed: todo.completed }, todo.type]"
        @click="selectTodo(todo)"
      >
        <div class="todo-title">{{ todo.title }}</div>
        <div class="todo-meta">
          <span>{{ todo.date }}</span>
          <span>{{ todo.status }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { TodoDisplayItem } from '@/types/mock'

export default defineComponent({
  emits: ['select-todo'],
  props: {
    todos: {
      type: Array as PropType<TodoDisplayItem[]>,
      required: true,
    },
  },
  setup(props, { emit }) {
    function selectTodo(todo: TodoDisplayItem) {
      emit('select-todo', todo)
    }

    return {
      selectTodo,
    }
  },
})
</script>

<style scoped>
.todo-list-panel {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
}

.todo-list-panel h3 {
  margin-top: 0;
}

.todo-list-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-list-panel li {
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.todo-list-panel li:last-child {
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

.completed .todo-title {
  text-decoration: line-through;
  color: #6b7280;
}
</style>
