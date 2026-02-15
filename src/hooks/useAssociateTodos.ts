import { useCallback, useState } from "react"
import type { AssociateTodo } from "@/types/data"
import { mockAssociateTodos } from "@/data/mockData"

const STORAGE_KEY = "associate-todos"

function loadTodos(): AssociateTodo[] {
  if (typeof window === "undefined") return mockAssociateTodos
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AssociateTodo[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return mockAssociateTodos
}

function saveTodos(todos: AssociateTodo[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    // ignore
  }
}

export function useAssociateTodos(): {
  tasks: AssociateTodo[]
  addTask: (task: Omit<AssociateTodo, "id">) => void
  toggleTaskStatus: (id: string) => void
  dismissTask: (id: string) => void
} {
  const [tasks, setTasks] = useState<AssociateTodo[]>(loadTodos)

  const addTask = useCallback((task: Omit<AssociateTodo, "id">) => {
    const id = `t-${Date.now()}`
    setTasks((prev) => {
      const next = [...prev, { ...task, id }]
      saveTodos(next)
      return next
    })
  }, [])

  const toggleTaskStatus = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? ("pending" as const) : ("done" as const) }
          : t
      )
      saveTodos(next)
      return next
    })
  }, [])

  const dismissTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id)
      saveTodos(next)
      return next
    })
  }, [])

  return { tasks, addTask, toggleTaskStatus, dismissTask }
}
