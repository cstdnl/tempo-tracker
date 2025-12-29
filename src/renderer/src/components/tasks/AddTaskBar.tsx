import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from "@/components/ui/separator"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_DESCRIPTION_LENGTH = 100

interface AddTaskBarProps {
  onAdd: (title: string, description?: string | null, collection?: string | null) => void | Promise<void>
  collection?: string | null
}

export default function AddTaskBar({
  onAdd,
  collection = null,
}: AddTaskBarProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [touched, setTouched] = useState(false)

  const isTitleInvalid = touched && !title.trim()

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault()
    setTouched(true)

    if (!title.trim()) return

    await onAdd(title.trim(), description.trim() || null, collection ?? null)

    setTitle('')
    setDescription('')
    setExpanded(false)
    setTouched(false)
  }

  const handleCancel = (): void => {
    setTitle('')
    setDescription('')
    setExpanded(false)
    setTouched(false)
  }

  return (
    <div className="sticky bottom-0 flex flex-col gap-2 backdrop-blur-sm">

      {!expanded ? (
        <div className="flex justify-start px-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary transition-colors h-8 px-2 -ml-2 rounded-(--radius)"
            onClick={() => setExpanded(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-xs font-bold tracking-wider">ADD TASK</span>
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 border text-card-foreground rounded-(--radius) p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <InputGroup className={cn(
                "rounded-(--radius) transition-all",
                isTitleInvalid ? "border-destructive ring-1 ring-destructive/20" : "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"
              )}>
                <InputGroupInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="What needs to be done?"
                  className="h-9 px-3"
                  autoFocus
                />
              </InputGroup>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <InputGroup className="rounded-(--radius) focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <InputGroupTextarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value.slice(0, MAX_DESCRIPTION_LENGTH)
                    )
                  }
                  placeholder="Add a description (optional)"
                  className="min-h-[80px] px-3 py-2 resize-none"
                />
                <InputGroupAddon align="block-end" className="justify-end border-t bg-muted/30 px-2 py-1">
                  <InputGroupText className="text-[10px] uppercase tracking-tight font-medium text-muted-foreground/70">
                    {MAX_DESCRIPTION_LENGTH - description.length} characters remaining
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 text-xs font-medium rounded-(--radius) hover:text-primary hover:bg-primary/10"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                size="sm"
                disabled={!title.trim()}
                className="h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-(--radius)"
              >
                Save Task
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
