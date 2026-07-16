import type { Todo } from '@/types/mock'

export type TodosState = {
  todos: Todo[]
}

export default function state(): TodosState {
  return {
    todos: [],
  }
}
