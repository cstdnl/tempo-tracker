import React, { useMemo, useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import DatePicker from '@/components/ui-custom/datepicker'
import ReportCard from '@/components/ui-custom/report-card'
import { useCollections } from '@/hooks/useCollections'
import { useCollectionContext } from '@/contexts/CollectionContext'
import { ChartPieInteractive } from '@renderer/components/reports/PieChart'
import { ProductivityHeatmap } from '@renderer/components/reports/ProductivityHeatmap'

function formatHHMMSS(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

function toStartMs(dateStr: string): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  d.setHours(0,0,0,0)
  return d.getTime()
}
function toEndMs(dateStr: string): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  d.setHours(23,59,59,999)
  return d.getTime()
}

// Local YYYY-MM-DD formatter
function formatLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function ReportPage(): React.JSX.Element {
  const { collections } = useCollections()
  const { selectedCollection: collection, setSelectedCollection: setCollection } = useCollectionContext()

  // default last 7 days
  const today = useMemo(() => new Date(), [])
  const toDefault = useMemo(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()), [today])
  const fromDefault = useMemo(() => {
    const d = new Date(toDefault)
    d.setDate(d.getDate() - 6)
    return d
  }, [toDefault])
  const [from, setFrom] = useState<string>(formatLocalYYYYMMDD(fromDefault))
  const [to, setTo] = useState<string>(formatLocalYYYYMMDD(toDefault))

  const [totalMs, setTotalMs] = useState<number>(0)
  const [totalDays, setTotalDays] = useState<number>(0)
  const [perTask, setPerTask] = useState<Array<{ name: string; duration_ms: number }>>([])
  const [history, setHistory] = useState<Array<{ date: string; duration_ms: number }>>([])

  useEffect(() => {
    let cancelled = false
    const fetchStats = async () => {
      const filters = {
        collection: collection === 'all' ? null : collection,
        from: toStartMs(from),
        to: toEndMs(to)
      }
      const [stats, historyData] = await Promise.all([
        window.api.exportTimeStats(filters),
        window.api.exportTimeHistory(filters)
      ])
      
      if (cancelled) return
      setTotalMs(stats.total_ms)
      setTotalDays(stats.total_days)
      setPerTask(stats.per_task.map(p => ({ name: p.task_title || `Task ${p.task_id}`, duration_ms: p.duration_ms })))
      setHistory(historyData)
    }
    fetchStats()
    return () => { cancelled = true }
  }, [collection, from, to])

  const avgTimePerTask = useMemo(() => {
    if (perTask.length === 0) return 0
    return totalMs / perTask.length
  }, [totalMs, perTask])

  async function handleDownloadCsv(): Promise<void> {
    const filters = {
      collection: collection === 'all' ? null : collection,
      from: toStartMs(from),
      to: toEndMs(to)
    }
    const csv = await window.api.exportTimeCsv(filters)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const fileBase = `time-report${collection === 'all' ? '' : `-task-${collection}`}`
    const fileName = `${fileBase}-${from}-${to}.csv`
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 fade-in duration-300">
      {/* Header */}
      <div className="px-6 py-4 backdrop-blur-sm z-20">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold tracking-tight">Reports</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Analyze your tracked time and productivity
          </p>
        </div>
      </div>
      
      <Separator className="w-full bg-muted-foreground/70 opacity-50" />

      {/* Top controls – Sticky below header */}
      <div className="px-2 py-3 bg-background/50 backdrop-blur-sm z-10 border-b border-border/40">
        <div className="grid grid-cols-4 gap-2 items-end max-w-2xl mx-auto">
          {/* Collection */}
          <Select value={collection} onValueChange={setCollection}>
            <SelectTrigger className="w-full truncate h-8 rounded-(--radius) bg-muted/50">
              <SelectValue placeholder="Choose collection" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="rounded-(--radius)">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              {collections.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* From date */}
          <DatePicker
            value={from}
            onChange={setFrom}
            buttonClassName="w-full h-8 truncate rounded-[var(--radius)] bg-muted/50"
          />

          {/* To date */}
          <DatePicker
            value={to}
            onChange={setTo}
            buttonClassName="w-full h-8 truncate rounded-[var(--radius)] bg-muted/50"
          />

          {/* Export */}
          <Button variant='outline' onClick={handleDownloadCsv} className="rounded-(--radius) h-8 bg-muted/50">Export</Button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-2xl py-4 px-2 space-y-8 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <ReportCard label="Total days" data={totalDays.toString()} />
              <ReportCard label="Tasks Done" data={perTask.length.toString()} />
              <ReportCard label="Total Hours" data={(totalMs / 3600000).toFixed(1) + 'h'} />
              <ReportCard label="Avg / Task" data={formatHHMMSS(avgTimePerTask)} />
            </div>
            
            {/* Chart Section */}
            <div className="grid gap-6">
              <ChartPieInteractive data={perTask} />
              <ProductivityHeatmap data={history} />
            </div>
          </div>
        </div>
      </ScrollArea>

      
    </div>
  )
}