import { app, ipcMain } from 'electron'
import { join } from 'path'
import Database from 'better-sqlite3'

let db: Database | null = null

type TaskStatus = 'active' | 'completed' | 'archived'

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  created_at: number
  collection: string | null
}

export interface TimeEntry {
  id: number
  task_id: number
  start_at: number
  end_at: number | null
  duration_ms: number | null
}

type SubtaskStatus = 'active' | 'completed' | 'archived'

export interface Subtask {
  id: number
  task_id: number
  title: string
  status: SubtaskStatus
  created_at: number
}

function createTables(database: Database): void {
  database.pragma('journal_mode = WAL')
  database.pragma('foreign_keys = ON')

  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      start_at INTEGER NOT NULL,
      end_at INTEGER,
      duration_ms INTEGER,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS collections (
      name TEXT PRIMARY KEY
    );
  `)

  const hasCollection = database
    .prepare("SELECT name FROM pragma_table_info('tasks') WHERE name = 'collection'")
    .get()
  if (!hasCollection) {
    database.exec("ALTER TABLE tasks ADD COLUMN collection TEXT")
  }
}

export function initDatabase(): void {
  const userData = app.getPath('userData')
  const dbPath = join(userData, 'tracker.sqlite3')
  db = new Database(dbPath)
  createTables(db)
}

function ensureDb(): Database {
  if (!db) throw new Error('Database not initialized')
  return db
}

// Task operations

function createTask(title: string, description?: string | null, collection?: string | null): Task {
  const database = ensureDb()
  const createdAt = Date.now()
  const stmt = database.prepare(
    'INSERT INTO tasks (title, description, status, created_at, collection) VALUES (?, ?, ?, ?, ?)'
  )
  const info = stmt.run(title, description ?? null, 'active', createdAt, collection ?? null)
  const row = database
    .prepare('SELECT id, title, description, status, created_at, collection FROM tasks WHERE id = ?')
    .get(info.lastInsertRowid) as Task
  return row
}

function listTasks(): Task[] {
  const database = ensureDb()
  return database
    .prepare('SELECT id, title, description, status, created_at, collection FROM tasks ORDER BY created_at DESC')
    .all() as Task[]
}

function updateTaskStatus(id: number, status: TaskStatus): Task {
  const database = ensureDb()
  database.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id)
  const row = database
    .prepare('SELECT id, title, description, status, created_at, collection FROM tasks WHERE id = ?')
    .get(id) as Task
  return row
}

function deleteTask(id: number): void {
  const database = ensureDb()
  database.prepare('DELETE FROM tasks WHERE id = ?').run(id)
}

// Time entry operations

function startTimer(taskId: number): TimeEntry {
  const database = ensureDb()
  const startAt = Date.now()
  const info = database
    .prepare('INSERT INTO time_entries (task_id, start_at) VALUES (?, ?)')
    .run(taskId, startAt)
  const row = database
    .prepare(
      'SELECT id, task_id, start_at, end_at, duration_ms FROM time_entries WHERE id = ?'
    )
    .get(info.lastInsertRowid) as TimeEntry
  return row
}

function stopTimer(entryId: number): TimeEntry {
  const database = ensureDb()
  const existing = database
    .prepare('SELECT id, task_id, start_at, end_at, duration_ms FROM time_entries WHERE id = ?')
    .get(entryId) as TimeEntry | undefined

  if (!existing) throw new Error('Time entry not found')
  if (existing.end_at) throw new Error('Time entry already stopped')

  const endAt = Date.now()
  const durationMs = endAt - existing.start_at
  database
    .prepare('UPDATE time_entries SET end_at = ?, duration_ms = ? WHERE id = ?')
    .run(endAt, durationMs, entryId)

  const row = database
    .prepare(
      'SELECT id, task_id, start_at, end_at, duration_ms FROM time_entries WHERE id = ?'
    )
    .get(entryId) as TimeEntry
  return row
}

function listTimeEntriesByTask(taskId: number): TimeEntry[] {
  const database = ensureDb()
  return database
    .prepare(
      'SELECT id, task_id, start_at, end_at, duration_ms FROM time_entries WHERE task_id = ? ORDER BY start_at DESC'
    )
    .all(taskId) as TimeEntry[]
}

// Subtask operations

function createSubtask(taskId: number, title: string): Subtask {
  const database = ensureDb()
  const createdAt = Date.now()
  const info = database
    .prepare('INSERT INTO subtasks (task_id, title, status, created_at) VALUES (?, ?, ?, ?)')
    .run(taskId, title, 'active', createdAt)
  const row = database
    .prepare('SELECT id, task_id, title, status, created_at FROM subtasks WHERE id = ?')
    .get(info.lastInsertRowid) as Subtask
  return row
}

function listSubtasksByTask(taskId: number): Subtask[] {
  const database = ensureDb()
  return database
    .prepare(
      'SELECT id, task_id, title, status, created_at FROM subtasks WHERE task_id = ? ORDER BY created_at ASC'
    )
    .all(taskId) as Subtask[]
}

function updateSubtaskStatus(id: number, status: SubtaskStatus): Subtask {
  const database = ensureDb()
  database.prepare('UPDATE subtasks SET status = ? WHERE id = ?').run(status, id)
  const row = database
    .prepare('SELECT id, task_id, title, status, created_at FROM subtasks WHERE id = ?')
    .get(id) as Subtask
  return row
}

function deleteSubtask(id: number): void {
  const database = ensureDb()
  database.prepare('DELETE FROM subtasks WHERE id = ?').run(id)
}

// Collection operations

function listCollections(): string[] {
  const database = ensureDb()
  const rows = database.prepare('SELECT name FROM collections ORDER BY name ASC').all() as { name: string }[]
  return rows.map(r => r.name)
}

function addCollection(name: string): void {
  const database = ensureDb()
  database.prepare('INSERT OR IGNORE INTO collections (name) VALUES (?)').run(name)
}

function deleteCollection(name: string): void {
  const database = ensureDb()
  database.transaction(() => {
    database.prepare('UPDATE tasks SET collection = NULL WHERE collection = ?').run(name)
    database.prepare('DELETE FROM collections WHERE name = ?').run(name)
  })()
}

export function registerIpcHandlers(): void {
  
  // Tasks
  ipcMain.handle(
    'tasks/create',
    (_e, payload: { title: string; description?: string | null; collection?: string | null }) =>
      createTask(payload.title, payload.description ?? null, payload.collection ?? null)
  )
  ipcMain.handle('tasks/list', () => listTasks())
  ipcMain.handle('tasks/updateStatus', (_e, payload: { id: number; status: TaskStatus }) =>
    updateTaskStatus(payload.id, payload.status)
  )
  ipcMain.handle('tasks/delete', (_e, payload: { id: number }) => deleteTask(payload.id))

  // Collections
  ipcMain.handle('collections/list', () => listCollections())
  ipcMain.handle('collections/add', (_e, payload: { name: string }) => addCollection(payload.name))
  ipcMain.handle('collections/delete', (_e, payload: { name: string }) => deleteCollection(payload.name))

  // Time entries
  ipcMain.handle('time/start', (_e, payload: { taskId: number }) => startTimer(payload.taskId))
  ipcMain.handle('time/stop', (_e, payload: { entryId: number }) => stopTimer(payload.entryId))
  ipcMain.handle('time/listByTask', (_e, payload: { taskId: number }) =>
    listTimeEntriesByTask(payload.taskId)
  )

  // Subtasks
  ipcMain.handle('subtasks/create', (_e, payload: { taskId: number; title: string }) =>
    createSubtask(payload.taskId, payload.title)
  )
  ipcMain.handle('subtasks/listByTask', (_e, payload: { taskId: number }) =>
    listSubtasksByTask(payload.taskId)
  )
  ipcMain.handle('subtasks/updateStatus', (_e, payload: { id: number; status: SubtaskStatus }) =>
    updateSubtaskStatus(payload.id, payload.status)
  )
  ipcMain.handle('subtasks/delete', (_e, payload: { id: number }) => deleteSubtask(payload.id))
  ipcMain.handle(
    'report/exportCsv',
    (_e, payload: { taskId?: number | null; collection?: string | null; from?: number | null; to?: number | null }) =>
      exportTimeCsv(payload)
  )
  ipcMain.handle(
    'report/stats',
    (_e, payload: { taskId?: number | null; collection?: string | null; from?: number | null; to?: number | null }) =>
      reportTimeStats(payload)
  )

  // Data management
  ipcMain.handle('data/export', () => exportData())
  ipcMain.handle('data/import', (_e, payload: { jsonString: string }) => importData(payload.jsonString))
}

function reportTimeStats(filters: { taskId?: number | null; collection?: string | null; from?: number | null; to?: number | null }): {
  total_ms: number
  total_days: number
  per_task: Array<{ task_id: number; task_title: string | null; duration_ms: number }>
} {
  const database = ensureDb()
  const where: string[] = []
  const params: any[] = []

  if (filters.taskId) {
    where.push('e.task_id = ?')
    params.push(filters.taskId)
  }
  if (filters.collection && filters.collection !== 'all') {
    if (filters.collection === 'default') {
      where.push('t.collection IS NULL')
    } else {
      where.push('t.collection = ?')
      params.push(filters.collection)
    }
  }
  if (filters.from) {
    where.push('e.start_at >= ?')
    params.push(filters.from)
  }
  if (filters.to) {
    where.push('e.start_at <= ?')
    params.push(filters.to)
  }

  const sql = `
    SELECT
      e.id,
      e.task_id,
      t.title AS task_title,
      e.start_at,
      e.end_at,
      e.duration_ms
    FROM time_entries e
    LEFT JOIN tasks t ON t.id = e.task_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY e.start_at DESC
  `
  const rows = database.prepare(sql).all(...params) as Array<{
    id: number
    task_id: number
    task_title: string | null
    start_at: number
    end_at: number | null
    duration_ms: number | null
  }>

  const now = Date.now()
  let total = 0
  const map = new Map<number, { task_id: number; task_title: string | null; duration_ms: number }>()
  const days = new Set<string>()

  for (const r of rows) {
    const endMs = r.end_at ?? now
    const durationMs = endMs - r.start_at
    const dur = Math.max(0, durationMs)

    const prev = map.get(r.task_id)
    if (prev) {
      prev.duration_ms += dur
    } else {
      map.set(r.task_id, { task_id: r.task_id, task_title: r.task_title, duration_ms: dur })
    }
    total += dur

    const date = new Date(r.start_at)
    const dayStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    days.add(dayStr)
  }

  return {
    total_ms: total,
    total_days: days.size,
    per_task: Array.from(map.values()).sort((a, b) => b.duration_ms - a.duration_ms)
  }
}

function exportTimeCsv(filters: { taskId?: number | null; collection?: string | null; from?: number | null; to?: number | null }): string {
  const database = ensureDb()
  const where: string[] = []
  const params: any[] = []

  if (filters.taskId) {
    where.push('e.task_id = ?')
    params.push(filters.taskId)
  }
  if (filters.collection && filters.collection !== 'all') {
    if (filters.collection === 'default') {
      where.push('t.collection IS NULL')
    } else {
      where.push('t.collection = ?')
      params.push(filters.collection)
    }
  }
  if (filters.from) {
    where.push('e.start_at >= ?')
    params.push(filters.from)
  }
  if (filters.to) {
    where.push('e.start_at <= ?')
    params.push(filters.to)
  }

  const sql = `
    SELECT
      e.id,
      e.task_id,
      t.title AS task_title,
      e.start_at,
      e.end_at,
      e.duration_ms
    FROM time_entries e
    LEFT JOIN tasks t ON t.id = e.task_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY e.start_at DESC
  `
  const rows = database.prepare(sql).all(...params) as Array<{
    id: number
    task_id: number
    task_title: string | null
    start_at: number
    end_at: number | null
    duration_ms: number | null
  }>

  const now = Date.now()
  const header = ['task_id', 'task_title', 'start_iso', 'end_iso', 'duration_ms', 'duration_hhmmss'].join(',')
  const lines = [header]

  for (const r of rows) {
    const endMs = r.end_at ?? now
    const durationMs = Math.max(0, endMs - r.start_at)
    const startIso = new Date(r.start_at).toISOString()
    const endIso = new Date(endMs).toISOString()
    const hhmmss = formatHHMMSS(durationMs)

    lines.push([
      r.task_id,
      (r.task_title || '').replace(/"/g, '""'),
      startIso,
      endIso,
      durationMs,
      hhmmss
    ].map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : String(v)).join(','))
  }

  return lines.join('\n')
}

function formatHHMMSS(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function exportData(): string {
  const database = ensureDb()
  const tasks = database.prepare('SELECT * FROM tasks').all()
  const timeEntries = database.prepare('SELECT * FROM time_entries').all()
  const subtasks = database.prepare('SELECT * FROM subtasks').all()
  const collections = database.prepare('SELECT * FROM collections').all()

  return JSON.stringify({
    version: 1,
    exported_at: Date.now(),
    data: {
      tasks,
      timeEntries,
      subtasks,
      collections
    }
  }, null, 2)
}

export function importData(jsonString: string): { success: boolean; error?: string } {
  const database = ensureDb()
  try {
    const backup = JSON.parse(jsonString)
    if (!backup.data) throw new Error('Invalid backup format')

    database.transaction(() => {
      // Clear existing data
      database.prepare('DELETE FROM subtasks').run()
      database.prepare('DELETE FROM time_entries').run()
      database.prepare('DELETE FROM tasks').run()
      database.prepare('DELETE FROM collections').run()

      // Restore collections
      if (backup.data.collections) {
        const insertCol = database.prepare('INSERT INTO collections (name) VALUES (?)')
        for (const col of backup.data.collections) {
          insertCol.run(col.name)
        }
      }

      // Restore tasks
      if (backup.data.tasks) {
        const insertTask = database.prepare(
          'INSERT INTO tasks (id, title, description, status, created_at, collection) VALUES (?, ?, ?, ?, ?, ?)'
        )
        for (const task of backup.data.tasks) {
          insertTask.run(task.id, task.title, task.description, task.status, task.created_at, task.collection)
        }
      }

      // Restore subtasks
      if (backup.data.subtasks) {
        const insertSubtask = database.prepare(
          'INSERT INTO subtasks (id, task_id, title, status, created_at) VALUES (?, ?, ?, ?, ?)'
        )
        for (const sub of backup.data.subtasks) {
          insertSubtask.run(sub.id, sub.task_id, sub.title, sub.status, sub.created_at)
        }
      }

      // Restore time entries
      if (backup.data.timeEntries) {
        const insertTime = database.prepare(
          'INSERT INTO time_entries (id, task_id, start_at, end_at, duration_ms) VALUES (?, ?, ?, ?, ?)'
        )
        for (const entry of backup.data.timeEntries) {
          insertTime.run(entry.id, entry.task_id, entry.start_at, entry.end_at, entry.duration_ms)
        }
      }
    })()

    return { success: true }
  } catch (err: any) {
    console.error('Import failed:', err)
    return { success: false, error: err.message }
  }
}