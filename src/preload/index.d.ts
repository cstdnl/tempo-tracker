export {}

declare global {
  type TaskStatus = 'active' | 'completed' | 'archived'

  interface Task {
    id: number
    title: string
    description: string | null
    status: TaskStatus
    created_at: number
    collection: string | null
  }

  interface TimeEntry {
    id: number
    task_id: number
    start_at: number
    end_at: number | null
    duration_ms: number | null
  }

  interface Subtask {
    id: number
    task_id: number
    title: string
    status: TaskStatus
    created_at: number
  }

  interface Window {
    api: {
      createTask: (title: string, description?: string | null, collection?: string | null) => Promise<Task>
      listTasks: () => Promise<Task[]>
      updateTaskStatus: (id: number, status: TaskStatus) => Promise<Task>
      deleteTask: (id: number) => Promise<void>
      listCollections: () => Promise<string[]>
      addCollection: (name: string) => Promise<void>
      deleteCollection: (name: string) => Promise<void>
      createSubtask: (taskId: number, title: string) => Promise<Subtask>
      listSubtasksByTask: (taskId: number) => Promise<Subtask[]>
      updateSubtaskStatus: (id: number, status: TaskStatus) => Promise<Subtask>
      deleteSubtask: (id: number) => Promise<void>

      startTimer: (taskId: number) => Promise<TimeEntry>
      stopTimer: (entryId: number) => Promise<TimeEntry>
      listTimeEntriesByTask: (taskId: number) => Promise<TimeEntry[]>
      exportTimeCsv: (filters: { taskId?: number | null; collection?: string | null; from?: number | null; to?: number | null }) => Promise<string>
      exportTimeStats: (filters: { taskId?: number | null; collection?: string | null; from?: number | null; to?: number | null }) => Promise<{
        total_ms: number
        total_days: number
        per_task: Array<{ task_id: number; task_title: string | null; duration_ms: number }>
      }>
      exportData: () => Promise<string>
      importData: (jsonString: string) => Promise<{ success: boolean; error?: string }>
    }
  }
}