import React from 'react'
import { Progress } from '@/components/ui/progress'

interface TaskStatsProps {
  completed: number
  total: number
}

export default function TaskStats({
  completed,
  total,
}: TaskStatsProps): React.JSX.Element {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <section className="flex items-center gap-3 rounded-md">
      <div className="flex-1 px-2">
        <Progress 
          value={pct} 
          className="h-2 rounded-(--radius) overflow-hidden bg-muted/50"
        />
      </div>

      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
        <span className="text-sm">
            {completed} of {total} DONE
          </span>
      </div>
    </section>
  )
}