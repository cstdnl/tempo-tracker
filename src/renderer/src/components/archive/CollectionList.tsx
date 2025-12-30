import { CollectionCard } from './CollectionCard'

interface CollectionListProps {
  collections: string[]
  collectionStats: Record<string, number>
  onSelectCollection: (name: string) => void
}

export function CollectionList({ collections, collectionStats, onSelectCollection }: CollectionListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-300">
      {collections.map(c => (
        <CollectionCard 
          key={c}
          name={c}
          taskCount={collectionStats[c] || 0}
          onClick={() => onSelectCollection(c)}
        />
      ))}
    </div>
  )
}