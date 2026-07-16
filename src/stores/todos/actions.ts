import { apiFetch } from '@/api'
import type { Todo } from '@/types/mock'
import type { TodosState } from './state'
import { useUiStore } from '@/stores/ui'

export const fetchTodos = async (state: TodosState, force = false) => {
  if (!force && state.todos.length > 0) return state.todos
  const data = await apiFetch<Todo[]>('/getAllToDos')
  state.todos.splice(0, state.todos.length, ...data)
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

export const getTodo = async (state: TodosState, id: string) => {
  const ui = useUiStore()
  await ui.ensureAllData()
  return todoById(state, id)
}
