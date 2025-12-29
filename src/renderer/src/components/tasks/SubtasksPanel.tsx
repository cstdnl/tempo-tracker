import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubtasksPanelProps {
  taskId: number
  subtasks?: Subtask[]
  onAdd: (taskId: number, title: string) => void | Promise<void>
  onToggleComplete: (subtaskId: number, completed: boolean, taskId: number) => void | Promise<void>
  onDelete: (subtaskId: number, taskId: number) => void | Promise<void>
}

export default function SubtasksPanel({
  taskId,
  subtasks,
  onAdd,
  onToggleComplete,
  onDelete
}: SubtasksPanelProps): React.JSX.Element {
  const [title, setTitle] = useState('')

  const handleAdd = async (): Promise<void> => {
    if (!title.trim()) return
    await onAdd(taskId, title.trim())
    setTitle('')
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="m-0 p-0 list-none space-y-1.5">
        {(subtasks ?? []).map((s) => (
          <li key={s.id} className="flex items-center gap-3 py-1 px-2 group hover:bg-muted/30 rounded-(--radius) transition-colors">
            <div className={cn(
              "flex-1 text-sm transition-all duration-200",
              s.status === 'completed' && "opacity-50 line-through text-muted-foreground"
            )}>
              {s.title}
            </div>

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                aria-label={s.status === 'completed' ? 'Mark subtask as active' : 'Mark subtask as done'}
                onClick={() => onToggleComplete(s.id, s.status !== 'completed', taskId)}
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-(--radius) transition-all duration-200",
                  s.status === 'completed'
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'border border-input bg-background hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
                )}
              >
                <Check className={cn("h-3.5 w-3.5", s.status === 'completed' && "stroke-[3px]")} />
              </button>

              <Button
                size="icon"
                aria-label="Delete subtask"
                onClick={() => onDelete(s.id, taskId)}
                className="h-7 w-7 rounded-(--radius) text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                variant="outline"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {/* Add subtask */}
      <div className="flex gap-2 items-center mt-1">
        <Input 
          placeholder="Add subtask..." 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="h-8 text-xs rounded-(--radius) bg-background/50 focus:bg-background transition-all" 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAdd()
            }
          }}
        />
        <Button 
          size="icon" 
          aria-label="Add subtask" 
          onClick={handleAdd} 
          variant="outline" 
          className="h-8 w-8 shrink-0 rounded-(--radius) hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200" 
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}