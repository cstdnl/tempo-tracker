import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Archive } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'

interface ArchivedTaskListProps {
  collectionName: string
  tasks: any[]
  onBack: () => void
}

export function ArchivedTaskList({ collectionName, tasks, onBack }: ArchivedTaskListProps) {
  const truncateText = (text: string, limit: number = 100) => {
    if (text.length <= limit) return text
    return text.slice(0, limit) + '...'
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

      <div className="px-6 py-4 border-b backdrop-blur-sm z-20">
        <div className="flex items-center gap-4">
          <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="rounded-(--radius) h-8 w-8 hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold tracking-tight capitalize">{collectionName} Archive</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid gap-2">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
              <Archive className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">No archived tasks in this collection</p>
            </div>
          ) : (
            tasks.map(task => (
              <Card key={task.id} className="rounded-(--radius) border bg-card/50 hover:bg-card transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1 min-w-0 pr-4">
                    <h3 className="text-sm font-bold wrap-break-word">
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
                      <p className="text-xs font-medium text-muted">Archived</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}