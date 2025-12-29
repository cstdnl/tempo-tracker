import { useCallback, useEffect, useMemo, useState } from 'react'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [runningByTask, setRunningByTask] = useState<Record<number, TimeEntry | null>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [subtasksByTask, setSubtasksByTask] = useState<Record<number, Subtask[]>>({})

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const allTasks = await window.api.listTasks()
      const list = allTasks.filter((t) => t.status !== 'archived')
      setTasks(list)

      const runningEntries = await Promise.all(
        list.map(async (t) => {
          const entries = await window.api.listTimeEntriesByTask(t.id)
          return [t.id, entries.find((e) => e.end_at == null) ?? null] as const
        })
      )

      const subtasksData = await Promise.all(
        list.map(async (t) => {
          const subtasks = await window.api.listSubtasksByTask(t.id)
          return [t.id, subtasks] as const
        })
      )

      const runningMap: Record<number, TimeEntry | null> = {}
      for (const [taskId, entry] of runningEntries) runningMap[taskId] = entry
      setRunningByTask(runningMap)

      const subtasksMap: Record<number, Subtask[]> = {}
      for (const [taskId, sList] of subtasksData) subtasksMap[taskId] = sList
      setSubtasksByTask(subtasksMap)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const addTask = useCallback(async (title: string, description?: string | null, collection?: string | null) => {
    if (!title.trim()) return
    await window.api.createTask(title.trim(), description?.trim() || null, collection ?? null)
    await loadTasks()
  }, [loadTasks])

  const start = useCallback(async (taskId: number) => {
    const entry = await window.api.startTimer(taskId)
    setRunningByTask((prev) => ({ ...prev, [taskId]: entry }))
  }, [])

  const pause = useCallback(async (taskId: number) => {
    const running = runningByTask[taskId]
    if (!running) return
    await window.api.stopTimer(running.id)
    setRunningByTask((prev) => ({ ...prev, [taskId]: null }))
  }, [runningByTask])

  const toggleComplete = useCallback(async (taskId: number, completed: boolean) => {
    const status: TaskStatus = completed ? 'completed' : 'active'
    
    // If marking as completed and timer is running, stop it
    if (completed && runningByTask[taskId]) {
      await pause(taskId)
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status } : t
      )
    )

    try {
      await window.api.updateTaskStatus(taskId, status)
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: completed ? "active" : "completed" }
            : t
        )
      )
    }
  }, [loadTasks, runningByTask, pause])

  const removeTask = useCallback(
    async (taskId: number) => {
      setRunningByTask((prev) => {
        const next = { ...prev }
        delete next[taskId]
        return next
      })

      setTasks((prev) => prev.filter((t) => t.id !== taskId))

      try {
        await window.api.deleteTask(taskId)
      } catch (err) {
        await loadTasks()
      }
    },
    [loadTasks]
  )

  const archiveTask = useCallback(async (taskId: number) => {
    const status: TaskStatus = 'archived'
    await window.api.updateTaskStatus(taskId, status)
    await loadTasks()
  }, [loadTasks])

  const loadSubtasks = useCallback(async (taskId: number) => {
    const list = await window.api.listSubtasksByTask(taskId)
    setSubtasksByTask((prev) => ({ ...prev, [taskId]: list }))
  }, [])

  const addSubtask = useCallback(async (taskId: number, title: string) => {
    if (!title.trim()) return
    await window.api.createSubtask(taskId, title.trim())
    await loadSubtasks(taskId)
  }, [loadSubtasks])

  const toggleSubtaskComplete = useCallback(async (subtaskId: number, completed: boolean, taskId: number) => {
    const status: TaskStatus = completed ? 'completed' : 'active'
    await window.api.updateSubtaskStatus(subtaskId, status)
    await loadSubtasks(taskId)
  }, [loadSubtasks])

  const deleteSubtask = useCallback(async (subtaskId: number, taskId: number) => {
    await window.api.deleteSubtask(subtaskId)
    await loadSubtasks(taskId)
  }, [loadSubtasks])

  return useMemo(() => ({
    tasks, runningByTask, loading,
    addTask, toggleComplete, start, pause, removeTask, archiveTask,
    subtasksByTask, loadSubtasks, addSubtask, toggleSubtaskComplete, deleteSubtask
  }), [
    tasks, runningByTask, loading,
    addTask, toggleComplete, start, pause, removeTask, archiveTask,
    subtasksByTask, loadSubtasks, addSubtask, toggleSubtaskComplete, deleteSubtask
  ])
}