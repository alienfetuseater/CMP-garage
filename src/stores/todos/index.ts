import { defineStore } from 'pinia'
import state from './state'
import * as actions from './actions'

export const useTodoStore = defineStore('todos', () => {
  const s = state()

  return {
    ...s,
    fetchTodos: (force?: boolean) => actions.fetchTodos(s, force),
    addTodo: (todo: import('@/types/mock').Todo) => actions.addTodo(s, todo),
    todoById: (id: string) => actions.todoById(s, id),
    todosForVessel: (id: string) => actions.todosForVessel(s, id),
  }
})
