import { defineStore } from 'pinia'
import state from './state'
import * as actions from './actions'
import type { Todo } from '@/types/mock'

export const useTodoStore = defineStore('todos', () => {
  const s = state()

  return {
    ...s,
    fetchTodos: (force?: boolean) => actions.fetchTodos(s, force),
    addTodo: (todo: Todo) => actions.addTodo(s, todo),
    todoById: (id: string) => actions.todoById(s, id),
    todosForVessel: (id: string) => actions.todosForVessel(s, id),
    getTodo: (id: string) => actions.getTodo(s, id),
  }
})
