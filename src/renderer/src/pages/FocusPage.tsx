import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TimerStatusFocus from '@/components/tasks/TimerStatusFocus'

interface FocusPageProps {
  task: Task
  entry: TimeEntry | null
  onStart: (taskId: number) => void
  onPause: (taskId: number) => void
  onExit: () => void
}

export default function FocusPage({ 
  task, 
  entry, 
  onStart, 
  onPause, 
  onExit 
}: FocusPageProps): React.JSX.Element {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onExit])

  return (
    <div 
      className="h-screen w-screen bg-background flex flex-col p-3 overflow-hidden select-none justify-center"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* Timer and Main Controls */}
      <div className="flex items-center gap-2 min-h-0 min-w-0">
        <div 
          className="flex-1 min-w-0"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          <TimerStatusFocus 
            task={task}
            entry={entry}
            onStart={onStart}
            onPause={onPause}
          />
        </div>
        
        <Button 
          variant="outline"
          size="icon" 
          className="h-9 w-9 rounded-(--radius) border-border hover:bg-muted text-muted-foreground transition-all shadow-sm shrink-0 relative z-10"
          onClick={onExit}
          title="Exit Focus (Esc)"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Task Title below Timer - Draggable handle */}
      <div 
        className="mt-3 px-1"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">
          {task.title}
        </h2>
      </div>
    </div>
  )
}