import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import { CollectionCard } from './CollectionCard'

interface CollectionListProps {
  collections: string[]
  collectionStats: Record<string, number>
  onSelectCollection: (name: string) => void
}

export function CollectionList({ collections, collectionStats, onSelectCollection }: CollectionListProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header - Fixed at top */}
      <div className="px-6 py-4backdrop-blur-sm z-20">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold tracking-tight">Archived Collections</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Select a collection to view its history
          </p>
        </div>
      </div>

      <Separator className="w-full bg-muted-foreground/70 opacity-50" />

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {collections.map(c => (
            <CollectionCard 
              key={c}
              name={c}
              taskCount={collectionStats[c] || 0}
              onClick={() => onSelectCollection(c)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}