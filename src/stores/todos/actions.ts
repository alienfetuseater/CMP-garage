import { apiFetch } from '@/api'
import type { Todo } from '@/types/mock'
import type { TodosState } from './state'

export const fetchTodos = async (state: TodosState, force = false) => {
  if (!force && state.todos.length > 0) return state.todos
  state.todos = await apiFetch<Todo[]>('/getAllToDos')
  return state.todos
}

export const addTodo = (state: TodosState, todo: Todo) => {
  const index = state.todos.findIndex((t) => t.id === todo.id)
  if (index >= 0) state.todos[index] = todo
  else state.todos.push(todo)
}

export const todoById = (state: TodosState, id: string) => {
  return state.todos.find((t) => t.id === id) ?? null
}

export const todosForVessel = (state: TodosState, vesselId: string) => {
  return state.todos.filter((t) => t.relatedTo?.type === 'vessel' && t.relatedTo.id === vesselId)
}
