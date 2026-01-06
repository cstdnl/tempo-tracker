import { useMemo, useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { format, subDays, startOfToday, eachDayOfInterval } from 'date-fns'

interface HeatmapData {
  date: string
  duration_ms: number
}

interface ProductivityHeatmapProps {
  data: HeatmapData[]
}

export function ProductivityHeatmap({ data }: ProductivityHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleWeeks, setVisibleWeeks] = useState(52)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        const count = Math.floor((width - 10) / 13)
        setVisibleWeeks(Math.max(1, count))
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const days = useMemo(() => {
    const today = startOfToday()
    const start = subDays(today, 364)
    return eachDayOfInterval({ start, end: today })
  }, [])

  const dataMap = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach((item) => {
      map.set(item.date, item.duration_ms)
    })
    return map
  }, [data])

  const getColorClass = (ms: number) => {
    if (ms === 0) return 'bg-muted/80 dark:bg-muted/50'
    const hours = ms / 3600000
    if (hours < 1) return 'bg-primary/30 dark:bg-primary/20'
    if (hours < 3) return 'bg-primary/50 dark:bg-primary/40'
    if (hours < 5) return 'bg-primary/70 dark:bg-primary/60'
    if (hours < 8) return 'bg-primary/90 dark:bg-primary/80'
    return 'bg-primary'
  }

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    if (hours === 0 && minutes === 0) return 'No activity'
    return `${hours}h ${minutes}m`
  }

  const weeks = useMemo(() => {
    const w: Date[][] = []
    let currentWeek: Date[] = []
    
    const firstDay = days[0].getDay()
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null as any)
    }

    days.forEach((day) => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        w.push(currentWeek)
        currentWeek = []
      }
    })
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null as any)
      }
      w.push(currentWeek)
    }
    
    return w.slice(-visibleWeeks)
  }, [days, visibleWeeks])

  return (
    <Card className="rounded-(--radius) overflow-hidden border-border/50">
      <CardHeader className="pb-4">
        <CardTitle>Productivity History</CardTitle>
        <CardDescription>Daily activity tracked</CardDescription>
      </CardHeader>
      <CardContent ref={containerRef}>
        <TooltipProvider delayDuration={0}>
          <div className="flex flex-col gap-2 overflow-hidden pb-2">
            <div className="flex pr-1 gap-[3px] justify-end">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIdx) => {
                    if (!day) return <div key={dayIdx} className="w-[10px] h-[10px]" />
                    
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const duration = dataMap.get(dateStr) || 0
                    
                    return (
                      <Tooltip key={dateStr}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-[10px] h-[10px] rounded-[1px] transition-colors hover:ring-1 hover:ring-ring hover:ring-offset-1 hover:ring-offset-background",
                              getColorClass(duration)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px] py-1 px-2">
                          <span className="font-semibold">{formatDuration(duration)}</span> on {format(day, 'MMM do, yyyy')}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
              <div className="flex gap-4">
                <span>Less</span>
                <div className="flex gap-[3px] items-center">
                  <div className="w-[10px] h-[10px] rounded-[1px] bg-muted/80 dark:bg-muted/50" />
                  <div className="w-[10px] h-[10px] rounded-[1px] bg-primary/30 dark:bg-primary/20" />
                  <div className="w-[10px] h-[10px] rounded-[1px] bg-primary/50 dark:bg-primary/40" />
                  <div className="w-[10px] h-[10px] rounded-[1px] bg-primary/70 dark:bg-primary/60" />
                  <div className="w-[10px] h-[10px] rounded-[1px] bg-primary/90 dark:bg-primary/80" />
                  <div className="w-[10px] h-[10px] rounded-[1px] bg-primary" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}