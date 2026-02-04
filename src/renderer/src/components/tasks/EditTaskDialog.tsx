import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

const MAX_DESCRIPTION_LENGTH = 100

interface EditTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (
    id: number,
    updates: { title?: string; description?: string | null; tags?: string[] }
  ) => Promise<void>
}

export default function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onUpdate
}: EditTaskDialogProps): React.JSX.Element {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [tagsString, setTagsString] = useState(task.tags ? task.tags.join(' ') : '')

  // Reset form when task changes or dialog opens
  useEffect(() => {
    if (open) {
      setTitle(task.title)
      setDescription(task.description || '')
      setTagsString(task.tags ? task.tags.join(' ') : '')
    }
  }, [open, task])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    
    // Parse tags: split by space/comma and remove # prefix
    const tags = tagsString
      .split(/[\s,]+/)
      .filter((t) => t.trim())
      .map((t) => t.replace(/^#/, ''))

    await onUpdate(task.id, {
      title: title.trim(),
      description: description.trim() || null,
      tags
    })
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px] rounded-(--radius) border border-white/10 bg-background/80 backdrop-blur-xl shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-sm font-bold tracking-widest uppercase text-muted-foreground/70">
            Edit Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <InputGroup className="rounded-(--radius) focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <InputGroupInput
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="h-9 px-3"
                required
              />
            </InputGroup>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <InputGroup className="rounded-(--radius) focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <InputGroupTextarea
                id="description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value.slice(0, MAX_DESCRIPTION_LENGTH)
                  )
                }
                className="min-h-[80px] px-3 py-2 resize-none"
                placeholder="Add a description (optional)"
              />
              <InputGroupAddon align="block-end" className="justify-end border-t bg-muted/30 px-2 py-1">
                <InputGroupText className="text-[10px] uppercase tracking-tight font-medium text-muted-foreground/70 italic">
                  {MAX_DESCRIPTION_LENGTH - description.length} characters remaining
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <InputGroup className="rounded-(--radius) focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <InputGroupInput
                id="tags"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="Tags (work, urgent...)"
                className="h-9 px-3 py-3"
              />
              <InputGroupAddon align="block-end" className="justify-end border-t bg-muted/30 px-2 py-1">
                <InputGroupText className="text-[10px] uppercase tracking-tight font-medium text-muted-foreground/70 italic">
                  Separate with spaces or commas
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <DialogFooter className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs font-medium rounded-(--radius) hover:text-primary hover:bg-primary/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-6 rounded-(--radius)"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}