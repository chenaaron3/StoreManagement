import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAssociateTodos } from "@/hooks/useAssociateTodos"
import type { AssociateTodo } from "@/types/data"
import { cn } from "@/lib/utils"

export function AssociateTodoList() {
  const { tasks, addTask, toggleTaskStatus, dismissTask } = useAssociateTodos()
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDueDate, setNewDueDate] = useState("")

  const handleAdd = () => {
    const title = newTitle.trim()
    if (!title) return
    addTask({
      title,
      dueDate: newDueDate || new Date().toISOString().slice(0, 10),
      status: "pending",
    })
    setNewTitle("")
    setNewDueDate("")
    setAdding(false)
  }

  const pending = tasks.filter((t) => t.status === "pending")
  const done = tasks.filter((t) => t.status === "done")

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Tasks assigned to me</h3>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            Add task
          </Button>
        )}
      </div>
      {adding && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border p-2">
          <Input
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="min-w-[160px]"
          />
          <Input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="w-[140px]"
          />
          <Button size="sm" onClick={handleAdd}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      )}
      <ul className="space-y-1.5">
        {pending.map((t) => (
          <TodoRow
            key={t.id}
            task={t}
            onToggle={() => toggleTaskStatus(t.id)}
            onDismiss={() => dismissTask(t.id)}
          />
        ))}
        {done.slice(0, 5).map((t) => (
          <TodoRow
            key={t.id}
            task={t}
            onToggle={() => toggleTaskStatus(t.id)}
            onDismiss={() => dismissTask(t.id)}
            done
          />
        ))}
        {done.length > 5 && (
          <li className="text-muted-foreground text-xs">
            +{done.length - 5} completed
          </li>
        )}
      </ul>
      {tasks.length === 0 && !adding && (
        <p className="text-muted-foreground text-sm">No tasks yet.</p>
      )}
    </div>
  )
}

function TodoRow({
  task,
  onToggle,
  onDismiss,
  done,
}: {
  task: AssociateTodo
  onToggle: () => void
  onDismiss: () => void
  done?: boolean
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
        done && "opacity-70"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 rounded border p-0.5"
        aria-label={done ? "Mark pending" : "Mark done"}
      >
        {done ? "✓" : "○"}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate", done && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        <p className="text-muted-foreground text-xs">
          Due: {task.dueDate}
          {task.memberId && ` · Customer: ${task.memberId}`}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        ×
      </Button>
    </li>
  )
}
