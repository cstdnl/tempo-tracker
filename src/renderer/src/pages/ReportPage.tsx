import React, { useMemo, useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import DatePicker from '@/components/ui-custom/datepicker'
import ReportCard from '@/components/ui-custom/report-card'
import { useCollections } from '@/hooks/useCollections'
import { ChartPieInteractive } from '@renderer/components/reports/PieChart'

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

// Local YYYY-MM-DD formatter (avoids UTC shift from toISOString)
function formatLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function ReportPage(): React.JSX.Element {
  const { collections } = useCollections()

  // default last 7 days
  const today = useMemo(() => new Date(), [])
  const toDefault = useMemo(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()), [today])
  const fromDefault = useMemo(() => {
    const d = new Date(toDefault)
    d.setDate(d.getDate() - 6)
    return d
  }, [toDefault])

  const [collection, setCollection] = useState<string>('all')
  const [from, setFrom] = useState<string>(formatLocalYYYYMMDD(fromDefault))
  const [to, setTo] = useState<string>(formatLocalYYYYMMDD(toDefault))

  const [totalMs, setTotalMs] = useState<number>(0)
  const [totalDays, setTotalDays] = useState<number>(0)
  const [perTask, setPerTask] = useState<Array<{ name: string; duration_ms: number }>>([])

  useEffect(() => {
    let cancelled = false
    const fetchStats = async () => {
      const filters = {
        collection: collection === 'all' ? null : collection,
        from: toStartMs(from),
        to: toEndMs(to)
      }
      const stats = await window.api.exportTimeStats(filters)
      if (cancelled) return
      setTotalMs(stats.total_ms)
      setTotalDays(stats.total_days)
      setPerTask(stats.per_task.map(p => ({ name: p.task_title || `Task ${p.task_id}`, duration_ms: p.duration_ms })))
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
    <section className="flex flex-col gap-2 text-sm">
      {/* Top controls – single row, equal width */}
      <div className="grid grid-cols-4 gap-2 items-end">
        {/* Collection */}
        <Select value={collection} onValueChange={setCollection}>
          <SelectTrigger className="w-full truncate h-8 rounded-(--radius)">
            <SelectValue placeholder="Choose collection" />
          </SelectTrigger>
          <SelectContent className="rounded-(--radius)">
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
          buttonClassName="w-full h-8 truncate rounded-[var(--radius)]"
        />

        {/* To date */}
        <DatePicker
          value={to}
          onChange={setTo}
          buttonClassName="w-full h-8 truncate rounded-[var(--radius)]"
        />

        {/* Export */}
        <Button variant='outline' onClick={handleDownloadCsv} className="rounded-(--radius)">Export</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 pt-3 pb-2 gap-3">
        <ReportCard label="Total days" data={totalDays.toString()} />
        <ReportCard label="Tasks Done" data={perTask.length.toString()} />
        <ReportCard label="Total Hours" data={(totalMs / 3600000).toFixed(1) + 'h'} />
        <ReportCard label="Avg / Task" data={formatHHMMSS(avgTimePerTask)} />
      </div>

      {/* Chart */}
      <ChartPieInteractive data={perTask} />
    </section>
  )
}