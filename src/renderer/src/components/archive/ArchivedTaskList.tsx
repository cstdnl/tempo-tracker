import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Archive, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ArchivedTaskListProps {
  collectionName: string
  tasks: any[]
  onRestore: (taskId: number) => Promise<void>
  onDelete: (taskId: number) => Promise<void>
  onBack: () => void
}

export function ArchivedTaskList({ 
  collectionName, 
  tasks, 
  onRestore,
  onDelete,
  onBack 
}: ArchivedTaskListProps) {
  const truncateText = (text: string, limit: number = 100) => {
    if (text.length <= limit) return text
    return text.slice(0, limit) + '...'
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between pb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="rounded-(--radius) h-8 px-2 text-xs font-bold tracking-wider hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          BACK TO COLLECTIONS
        </Button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
        </span>
      </div>

      <div className="grid gap-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
            <Archive className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">No archived tasks in this collection</p>
          </div>
        ) : (
          tasks.map(task => (
            <Card key={task.id} className="rounded-(--radius) border border-muted-foreground/10 bg-muted/30 hover:bg-muted/50 transition-colors shadow-none">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1 min-w-0 pr-4">
                  <h3 className="text-sm font-bold wrap-break-word text-foreground">
                    {truncateText(task.title)}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-muted-foreground wrap-break-word whitespace-pre-wrap">
                      {truncateText(task.description)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                    <p className="text-xs font-medium text-muted-foreground">Archived</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-(--radius) text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-(--radius) min-w-[120px]">
                      <DropdownMenuItem 
                        onClick={() => onRestore(task.id)}
                        className="text-xs tracking-wider cursor-pointer"
                      >
                        Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(task.id)}
                        className="text-xs tracking-wider text-destructive focus:text-destructive cursor-pointer"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}