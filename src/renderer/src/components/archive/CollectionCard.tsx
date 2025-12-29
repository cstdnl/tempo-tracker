import { Card, CardContent } from '@/components/ui/card'
import { FolderArchive, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollectionCardProps {
  name: string
  taskCount: number
  onClick: () => void
}

export function CollectionCard({ name, taskCount, onClick }: CollectionCardProps) {
  const hasTasks = taskCount > 0

  return (
    <Card 
      className={cn(
        "group cursor-pointer rounded-(--radius) border transition-all hover:ring-1 hover:ring-primary/20 hover:border-primary/30",
        hasTasks ? "bg-muted/60" : "bg-muted/30"
      )}
      onClick={() => hasTasks && onClick()}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div className="p-2 rounded-(--radius) bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
          <FolderArchive className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold capitalize truncate">{name}</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter truncate">
            {taskCount} {taskCount === 1 ? 'Archived Task' : 'Archived Tasks'}
          </p>
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </CardContent>
    </Card>
  )
}