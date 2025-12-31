import React from 'react'
import TaskItem from './TaskItem'
import { cn } from '@/lib/utils'

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  runningByTask: Record<number, TimeEntry | null>
  onToggleComplete: (taskId: number, completed: boolean) => void
  onStart: (taskId: number) => void
  onPause: (taskId: number) => void
  onDelete: (taskId: number) => void
  onArchive: (taskId: number) => void
  onEnterFocus: (taskId: number) => void
}

export default function TaskList({
  tasks, loading, runningByTask, onToggleComplete, onStart, onPause, onDelete, onArchive, onEnterFocus,
  subtasksByTask, loadSubtasks, addSubtask, toggleSubtaskComplete, deleteSubtask,
  className
}: TaskListProps & {
  subtasksByTask: Record<number, Subtask[]>
  loadSubtasks: (taskId: number) => Promise<void> | void
  addSubtask: (taskId: number, title: string) => Promise<void> | void
  toggleSubtaskComplete: (subtaskId: number, completed: boolean, taskId: number) => Promise<void> | void
  deleteSubtask: (subtaskId: number, taskId: number) => Promise<void> | void
  className?: string
}): React.JSX.Element {
  if (loading) {
    return <div className="p-4 text-center opacity-50 text-xs">Loading tasks...</div>
  }

  if (tasks.length === 0) {
    return <div className="p-8 text-center opacity-50 text-xs italic">No tasks in this list.</div>
  }

  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {tasks.map((t) => (
        <TaskItem
          key={t.id}
          task={t}
          running={!!runningByTask[t.id]}
          onToggleComplete={onToggleComplete}
          onStart={onStart}
          onPause={onPause}
          onDelete={onDelete}
          onArchive={onArchive}
          onEnterFocus={onEnterFocus}
          loadSubtasks={loadSubtasks}
          subtasks={subtasksByTask[t.id]}
          addSubtask={addSubtask}
          toggleSubtaskComplete={toggleSubtaskComplete}
          deleteSubtask={deleteSubtask}
        />
      ))}
    </ul>
  )
}