import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // Tasks
  createTask: (title: string, description?: string | null, collection?: string | null) =>
    ipcRenderer.invoke('tasks/create', { title, description: description ?? null, collection: collection ?? null }),
  listTasks: () => ipcRenderer.invoke('tasks/list'),
  updateTaskStatus: (id: number, status: 'active' | 'completed' | 'archived') =>
    ipcRenderer.invoke('tasks/updateStatus', { id, status }),
  deleteTask: (id: number) => ipcRenderer.invoke('tasks/delete', { id }),

  // Collections
  listCollections: () => ipcRenderer.invoke('collections/list'),
  addCollection: (name: string) => ipcRenderer.invoke('collections/add', { name }),
  deleteCollection: (name: string) => ipcRenderer.invoke('collections/delete', { name }),

  // Time entries
  startTimer: (taskId: number) => ipcRenderer.invoke('time/start', { taskId }),
  stopTimer: (entryId: number) => ipcRenderer.invoke('time/stop', { entryId }),
  listTimeEntriesByTask: (taskId: number) => ipcRenderer.invoke('time/listByTask', { taskId }),
  // Subtasks
  createSubtask: (taskId: number, title: string) =>
    ipcRenderer.invoke('subtasks/create', { taskId, title }),
  listSubtasksByTask: (taskId: number) =>
    ipcRenderer.invoke('subtasks/listByTask', { taskId }),
  updateSubtaskStatus: (id: number, status: 'active' | 'completed' | 'archived') =>
    ipcRenderer.invoke('subtasks/updateStatus', { id, status }),
  deleteSubtask: (id: number) => ipcRenderer.invoke('subtasks/delete', { id }),

  // Reports
  exportTimeCsv: (filters: { taskId?: number | null; collection?: string | null; from?: number | null; to?: number | null }) =>
    ipcRenderer.invoke('report/exportCsv', filters),
  exportTimeStats: (filters: { taskId?: number | null; collection?: string | null; from?: number | null; to?: number | null }) =>
    ipcRenderer.invoke('report/stats', filters),
  exportTimeHistory: (filters: { collection?: string | null; from?: number | null; to?: number | null }) =>
    ipcRenderer.invoke('report/history', filters),

  // Data management
  exportData: () => ipcRenderer.invoke('data/export'),
  importData: (jsonString: string) => ipcRenderer.invoke('data/import', { jsonString }),

  // Navigation
  onNavigate: (callback: (page: 'main' | 'archive' | 'export' | 'settings') => void) =>
    ipcRenderer.on('navigate', (_event, page) => callback(page)),
  // Window Management
  setFocusMode: (enabled: boolean) => ipcRenderer.send('window/focus-mode', enabled),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}