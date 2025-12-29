import React, { useEffect, useMemo, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TimerStatusProps {
  entry: TimeEntry | null
}

function formatHHMMSS(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export default function TimerStatus({ entry }: TimerStatusProps): React.JSX.Element {
  const [now, setNow] = useState<number>(Date.now())

  useEffect(() => {
    if (!entry) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [entry])

  const elapsedMs = useMemo(() => {
    if (!entry) return 0
    return now - entry.start_at
  }, [entry, now])

  const timeText = formatHHMMSS(elapsedMs)

  return (
    <Card
      className={cn(
        'min-w-[120px] bg-muted-foreground/5 transition-all duration-200 shadow-sm border rounded-(--radius)',
        entry ? 'border-primary/30 bg-primary/5 shadow-sm shadow-primary/10' : 'border-border'
      )}
      aria-live="polite"
    >
      <CardContent className="flex items-center justify-between gap-4">
        <div
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-(--radius) transition-colors',
            entry ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-muted text-muted-foreground'
          )}
        >
          {entry ? (
            <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
          ) : (
            <Pause className="w-4.5 h-4.5" />
          )}
        </div>
        <div className={cn(
          "font-semibold text-2xl tracking-tight tabular-nums pr-2",
          entry ? "text-primary" : "text-muted-foreground"
        )}>
          {timeText}
        </div>
      </CardContent>
    </Card>
  )
}