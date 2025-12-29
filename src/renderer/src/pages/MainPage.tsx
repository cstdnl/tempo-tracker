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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Settings2, CheckCircle2 } from 'lucide-react'
import { Separator } from '@renderer/components/ui/separator'
import { ScrollArea } from '@renderer/components/ui/scroll-area'

export default function MainPage(): React.JSX.Element {
  const {
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
    deleteSubtask
  } = useTasks()

  const { collections, addCollection, deleteCollection } = useCollections()
  const [collection, setCollection] = useState<string>('all')
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

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-4">
      {/* Top Controls */}
      <section className="flex items-center gap-2 p-1 bg-muted/30 rounded-(--radius) border shrink-0">
        {/* Collection selector */}
        <div className="flex-1 flex items-center gap-2 px-2">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Collection</span>
          <Select value={collection} onValueChange={setCollection}>
            <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 transition-colors focus:ring-0 focus:ring-offset-0 px-2 rounded-(--radius) w-[160px]">
              <SelectValue placeholder="Select a collection" />
            </SelectTrigger>
            <SelectContent className="rounded-(--radius)">
              <SelectItem value="all" className="rounded-(--radius)">All Collections</SelectItem>
              <SelectItem value="default" className="rounded-(--radius)">Default</SelectItem>
              {collections.map((c) => (
                <SelectItem key={c} value={c} className="rounded-(--radius)">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Manage Collections Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-(--radius) px-3"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Manage</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0 rounded-(--radius) shadow-lg border-primary/20" align="end">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Collections</h4>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                  {collections.length}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="New collection name..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCollection()}
                  className="h-8 text-xs rounded-(--radius) bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                />
                <Button 
                  size="icon" 
                  className="h-8 w-8 shrink-0 rounded-(--radius) bg-primary hover:bg-primary/90" 
                  onClick={handleAddCollection}
                  disabled={!newCollectionName.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {collections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Settings2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">No custom collections</p>
                  </div>
                ) : (
                  <div className="grid gap-1">
                    {collections.map((c) => (
                      <div 
                        key={c} 
                        className="flex items-center justify-between group p-2 rounded-(--radius) hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm font-medium truncate text-foreground/80 group-hover:text-foreground">
                          {c}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all rounded-(--radius) text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCollection(c)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </section>

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

            <Separator />
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