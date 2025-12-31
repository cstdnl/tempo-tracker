"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { type PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function formatHHMMSS(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

interface DurationPieChartProps {
  data: Array<{ name: string; duration_ms: number }>
  title?: string
  description?: string
}

export function ChartPieInteractive({ data, title = "Time Distribution", description = "Total duration per item" }: DurationPieChartProps) {
  const id = "pie-interactive"
  
  // If no data, return empty state or null
  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col rounded-(--radius)">
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center h-[300px] text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    )
  }

  const chartData = React.useMemo(() => {
    return data.map((item, index) => {
      const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
      return {
        ...item,
        fill: `var(--color-${key})`,
      }
    })
  }, [data])

  const config = React.useMemo(() => {
    const cfg: ChartConfig = {
      duration_ms: {
        label: "Duration",
      },
    }
    data.forEach((item, index) => {
      const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
      cfg[key] = {
        label: item.name,
        color: `var(--chart-${(index % 5) + 1})`,
      }
    })
    return cfg
  }, [data])

  const [activeItem, setActiveItem] = React.useState(chartData[0].name)

  const activeIndex = React.useMemo(() => {
    const index = chartData.findIndex((item) => item.name === activeItem)
    return index !== -1 ? index : 0
  }, [activeItem, chartData])

  return (
    <Card data-chart={id} className="flex flex-col rounded-(--radius) bg-muted/20 border-none">
      <ChartStyle id={id} config={config} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select value={activeItem} onValueChange={setActiveItem}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-(--radius) pl-2.5"
            aria-label="Select an item"
          >
            <SelectValue placeholder="Select item" />
          </SelectTrigger>
          <SelectContent position="popper" align="end" className="rounded-(--radius)">
            {chartData.map((item, index) => {
              const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
              const itemConfig = config[key]

              return (
                <SelectItem
                  key={item.name}
                  value={item.name}
                  className="rounded-(--radius) [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--chart-${(index % 5) + 1})`,
                      }}
                    />
                    {itemConfig?.label || item.name}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={config}
          className="mx-auto aspect-square w-full max-w-[300px] max-h-[210px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                  hideLabel 
                  formatter={(value, name) => {
                    const label = config[name as keyof typeof config]?.label || name
                    return (
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{label}:</div>
                        <div className="font-mono">{formatHHMMSS(Number(value))}</div>
                      </div>
                    )
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="duration_ms"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-xl font-bold font-mono"
                        >
                          {chartData[activeIndex] ? formatHHMMSS(chartData[activeIndex].duration_ms) : "00:00:00"}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          {chartData[activeIndex] 
                            ? (chartData[activeIndex].name.length > 15 
                                ? chartData[activeIndex].name.slice(0, 12) + "..."
                                : chartData[activeIndex].name)
                            : ""}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
