import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import SubtasksPanel from './SubtasksPanel'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Check, ChevronDownIcon, MoreHorizontal, Pause, Play } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from "@/lib/utils"
import { CircularProgress } from '@renderer/components/ui-custom/progress-circular'

interface TaskItemProps {
  task: Task
  running: boolean
  onToggleComplete: (taskId: number, completed: boolean) => void
  onStart: (taskId: number) => void
  onPause: (taskId: number) => void
  onDelete: (taskId: number) => void
  onArchive: (taskId: number) => void
}

export default function TaskItem({
  task,
  running,
  onToggleComplete,
  onStart,
  onPause,
  onDelete,
  onArchive,
  // new props passed through TaskList → MainPage → useTasks
  loadSubtasks,
  subtasks,
  addSubtask,
  toggleSubtaskComplete,
  deleteSubtask
}: TaskItemProps & {
  loadSubtasks: (taskId: number) => Promise<void> | void
  subtasks?: Subtask[]
  addSubtask: (taskId: number, title: string) => Promise<void> | void
  toggleSubtaskComplete: (subtaskId: number, completed: boolean, taskId: number) => Promise<void> | void
  deleteSubtask: (subtaskId: number, taskId: number) => Promise<void> | void
}): React.JSX.Element {
  const [showSubtasks, setShowSubtasks] = useState(false)

  useEffect(() => {
    if (showSubtasks) {
      loadSubtasks(task.id)
    }
  }, [showSubtasks, loadSubtasks, task.id])

  const subtasksList = subtasks || []
  const totalSubtasks = subtasksList.length
  const completedSubtasks = subtasksList.filter((s) => s.status === 'completed').length
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  return (
    <Card
      className={cn(
        "group transition-all duration-200 border rounded-(--radius) shadow-none overflow-hidden",
        running
          ? "border-primary/20 bg-primary/2 shadow-sm shadow-primary/5"
          : "border-border bg-card/30 hover:bg-card/40 hover:border-primary/20"
      )}
    >
      <li className="list-none">
        <Collapsible open={showSubtasks} onOpenChange={setShowSubtasks}>
          <CardHeader className="px-3 flex flex-row items-center gap-3 space-y-0">
            <CollapsibleTrigger asChild className="group">
              <Button variant="ghost" size="icon" className="rounded-(--radius) h-8 w-8">
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>

            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-semibold truncate transition-colors",
                task.status === 'completed' ? "text-muted-foreground/50 line-through" : "text-foreground",
                running && "text-primary"
              )}>
                {task.title}
              </div>
              {task.description && (
                <div className="text-xs text-muted-foreground/80 truncate">
                  {task.description}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {totalSubtasks > 0 && (
                <div className="flex items-center gap-1.5 mr-1 text-[10px] font-bold text-muted-foreground/80">
                  <CircularProgress 
                    value={progressPercentage} 
                    size={14} 
                    strokeWidth={2} 
                  />
                  <span className="tabular-nums whitespace-nowrap">
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </div>
              )}

              {running ? (
                <Button
                  variant="default"
                  onClick={() => onPause(task.id)}
                  size="icon"
                  className="h-8 w-8 rounded-(--radius) shadow-sm shadow-primary/20"
                  aria-label="Pause"
                  disabled={task.status === 'completed'}
                >
                  <Pause className="h-4 w-4 fill-current" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => onStart(task.id)}
                  size="icon"
                  className="h-8 w-8 rounded-(--radius) hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all"
                  aria-label="Start"
                  disabled={task.status === 'completed'}
                >
                  <Play className="h-4 w-4 fill-current" />
                </Button>
              )}

              <Button
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-(--radius) transition-all",
                  task.status === 'completed'
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
                    : "border border-input hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                )}
                variant={task.status === 'completed' ? 'default' : 'outline'}
                aria-label={task.status === 'completed' ? 'Mark as active' : 'Mark as done'}
                onClick={() => onToggleComplete(task.id, task.status !== 'completed')}
              >
                <Check className={cn("h-4 w-4", task.status === 'completed' && "stroke-[3px]")} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-(--radius)" aria-label="More">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-(--radius)">
                  <DropdownMenuItem onClick={() => onArchive(task.id)}>Archive</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="px-3">
              <div className="py-2">
                <SubtasksPanel
                  taskId={task.id}
                  subtasks={subtasks}
                  onAdd={addSubtask}
                  onToggleComplete={toggleSubtaskComplete}
                  onDelete={deleteSubtask}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </li>
    </Card>
  )
}