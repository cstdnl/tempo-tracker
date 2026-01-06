import React, { useState, useMemo } from 'react'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'
import TaskStats from '@/components/tasks/TaskStats'
import TaskList from '@/components/tasks/TaskList'
import AddTaskBar from '@/components/tasks/AddTaskBar'
import { useTasks } from '@/hooks/useTasks'
import TimerStatus from '@/components/tasks/TimerStatus'
import { useCollections } from '@/hooks/useCollections'
import { useCollectionContext } from '@/contexts/CollectionContext'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Settings2, CheckCircle2, Archive } from 'lucide-react'
import { Separator } from '@renderer/components/ui/separator'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { cn } from '@renderer/lib/utils'

interface MainPageProps {
  tasks: Task[]
  runningByTask: Record<number, TimeEntry | null>
  loading: boolean
  addTask: (title: string, description?: string | null, collection?: string | null) => Promise<void>
  toggleComplete: (taskId: number, completed: boolean) => Promise<void>
  start: (taskId: number) => Promise<void>
  pause: (taskId: number) => Promise<void>
  removeTask: (taskId: number) => Promise<void>
  archiveTask: (taskId: number) => Promise<void>
  subtasksByTask: Record<number, Subtask[]>
  loadSubtasks: (taskId: number) => Promise<void> | void
  addSubtask: (taskId: number, title: string) => Promise<void> | void
  toggleSubtaskComplete: (subtaskId: number, completed: boolean, taskId: number) => Promise<void> | void
  deleteSubtask: (subtaskId: number, taskId: number) => Promise<void> | void
  onEnterFocus: (taskId: number) => void
}

export default function MainPage({
  tasks,
  runningByTask,
  loading,
  addTask,
  toggleComplete,
  start,
  pause,
  removeTask,
  archiveTask,
  subtasksByTask,
  loadSubtasks,
  addSubtask,
  toggleSubtaskComplete,
  deleteSubtask,
  onEnterFocus
}: MainPageProps): React.JSX.Element {
  const { collections, addCollection, deleteCollection } = useCollections()
  const { archiveCollection } = useTasks()
  const { selectedCollection: collection, setSelectedCollection: setCollection } = useCollectionContext()

  const [newCollectionName, setNewCollectionName] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)

  const filteredTasks = useMemo(() => {
    if (collection === 'all') return tasks
    return tasks.filter((t) => (t.collection ?? 'default') === collection)
  }, [tasks, collection])

  const activeTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.status !== 'completed')
  }, [filteredTasks])

  const completedTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.status === 'completed')
  }, [filteredTasks])

  const handleAddCollection = async (): Promise<void> => {
    if (!newCollectionName.trim()) return
    await addCollection(newCollectionName.trim())
    setNewCollectionName('')
  }

  const handleDeleteCollection = async (name: string): Promise<void> => {
    await deleteCollection(name)
    if (collection === name) {
      setCollection('all')
    }
  }

  const completedCount = completedTasks.length
  const totalCount = filteredTasks.length

  const currentRunning = useMemo(() => {
    for (const t of filteredTasks) {
      const entry = runningByTask[t.id]
      if (entry) return { task: t, entry }
    }
    return null
  }, [filteredTasks, runningByTask])

  // Helper to get initials and color for the badge
  const getCollectionBadge = (name: string) => {
    if (name === 'all') return { text: 'AL', style: { backgroundColor: 'var(--muted)' }, className: 'text-muted-foreground' }
    if (name === 'default') return { text: 'DF', style: { backgroundColor: 'var(--muted)' }, className: 'text-muted-foreground' }
    
    const initials = name
      .split(/[\s-_]+/)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    
    const index = collections.indexOf(name)
    const colorVar = `var(--chart-${((index !== -1 ? index : 0) % 5) + 1})`
    
    return { text: initials, style: { backgroundColor: colorVar }, className: 'text-white' }
  }

  const badge = getCollectionBadge(collection)

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-4">
      {/* Top Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <div 
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md text-[10px] font-bold shrink-0 shadow-sm transition-all",
            badge.className
          )}
          style={badge.style}
        >
          {badge.text}
        </div>

        <Select value={collection} onValueChange={setCollection}>
          <SelectTrigger className="bg-muted/50 hover:bg-muted transition-colors rounded-(--radius) w-[200px]">
            <SelectValue placeholder="Select a collection" />
          </SelectTrigger>
          <SelectContent position="popper" align="start" className="rounded-(--radius)">
            <SelectItem value="all" className="rounded-(--radius)">All</SelectItem>
            <SelectItem value="default" className="rounded-(--radius)">Default</SelectItem>
            {collections.map((c) => (
              <SelectItem key={c} value={c} className="rounded-(--radius)">
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {/* Manage Collections Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground bg-muted/50 hover:bg-muted hover:text-primary transition-all rounded-(--radius) px-3 border-none"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Manage</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 rounded-(--radius) shadow-xl border-none bg-popover" align="end">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/70">Collections</h4>
                <div className="h-4 px-1.5 flex items-center justify-center bg-muted rounded-full">
                  <span className="text-[9px] font-bold text-muted-foreground">{collections.length}</span>
                </div>
              </div>
              
              <div className="flex gap-1.5">
                <Input
                  placeholder="New collection..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCollection()}
                  className="h-8 text-xs rounded-(--radius) bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-muted-foreground/40"
                />
                <Button 
                  size="icon" 
                  className="h-8 w-8 shrink-0 rounded-(--radius) bg-primary hover:bg-primary/90 shadow-sm" 
                  onClick={handleAddCollection}
                  disabled={!newCollectionName.trim()}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-0.5 max-h-48 overflow-y-auto pr-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {collections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 opacity-40">
                    <Settings2 className="h-5 w-5 text-muted-foreground" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Empty</p>
                  </div>
                ) : (
                  <div className="grid gap-0.5">
                    {collections.map((c) => (
                      <div 
                        key={c} 
                        className="flex items-center justify-between group px-2 py-1.5 rounded-(--radius) hover:bg-muted/40 transition-all duration-200"
                      >
                        <span className="text-xs font-medium truncate text-foreground/70 group-hover:text-foreground">
                          {c}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-(--radius) text-muted-foreground/50 hover:text-primary hover:bg-primary/10"
                            onClick={() => archiveCollection(c)}
                            title="Archive all tasks in this collection"
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-(--radius) text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteCollection(c)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Task stats and Timer - Fixed */}
      <div className="shrink-0 space-y-4">
        <TaskStats completed={completedCount} total={totalCount} />
        <TimerStatus entry={currentRunning?.entry ?? null} />
      </div>

      {/* Scrollable Area for Tasks */}
      <ScrollArea className="flex-1 min-h-0 -mx-4 px-4">
        <div className="space-y-6 pb-6">
          {/* Active Tasks */}
          <div className="space-y-4">
            <TaskList
              tasks={activeTasks}
              loading={loading}
              runningByTask={runningByTask}
              onToggleComplete={toggleComplete}
              onStart={start}
              onPause={pause}
              onDelete={removeTask}
              onArchive={archiveTask}
              onEnterFocus={onEnterFocus}
              subtasksByTask={subtasksByTask}
              loadSubtasks={loadSubtasks}
              addSubtask={addSubtask}
              toggleSubtaskComplete={toggleSubtaskComplete}
              deleteSubtask={deleteSubtask}
            />

            <AddTaskBar
              onAdd={(title, desc) => addTask(title, desc, collection === 'all' ? 'default' : collection)}
              collection={collection === 'all' ? 'default' : collection}
            />

            <Separator className="w-full bg-muted-foreground/70 opacity-50" />
          </div>

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 group transition-colors"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground group-hover:text-primary transition-colors">
                  Completed — {completedTasks.length}
                </span>
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[10px] font-medium text-muted-foreground/50">
                  {showCompleted ? 'Hide' : 'Show'}
                </span>
              </button>

              {showCompleted && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <TaskList
                    tasks={completedTasks}
                    loading={loading}
                    runningByTask={runningByTask}
                    onToggleComplete={toggleComplete}
                    onStart={start}
                    onPause={pause}
                    onDelete={removeTask}
                    onArchive={archiveTask}
                    onEnterFocus={onEnterFocus}
                    subtasksByTask={subtasksByTask}
                    loadSubtasks={loadSubtasks}
                    addSubtask={addSubtask}
                    toggleSubtaskComplete={toggleSubtaskComplete}
                    deleteSubtask={deleteSubtask}
                    className="opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}