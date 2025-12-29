import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DatePickerProps = {
  id?: string
  label?: string
  value?: string | Date
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  buttonClassName?: string
  align?: "start" | "center" | "end"
  disabled?: boolean
}

function formatYYYYMMDD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseYYYYMMDD(s?: string | Date): Date | undefined {
  if (!s) return undefined
  if (s instanceof Date) return s
  const parts = s.split("-")
  if (parts.length !== 3) return undefined
  const [y, m, d] = parts.map((p) => Number(p))
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return undefined
  return new Date(y, m - 1, d)
}

export default function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "Select date",
  className,
  buttonClassName,
  align = "start",
  disabled
}: DatePickerProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const selectedDate = parseYYYYMMDD(value)

  return (
    <div className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      {label && (
        <Label htmlFor={id} className="px-1">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            aria-label={label ? `Pick ${label}` : "Pick date"}
            className={buttonClassName}
          >
            {selectedDate ? formatYYYYMMDD(selectedDate) : placeholder}
            <ChevronDownIcon className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0 rounded-(--radius)" align={align}>
          <Calendar
            mode="single"
            selected={selectedDate}
            captionLayout="dropdown"
            onSelect={(d) => {
              if (d) {
                onChange(formatYYYYMMDD(d))
                setOpen(false)
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
