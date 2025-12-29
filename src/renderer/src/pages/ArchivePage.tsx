import React, { useState, useEffect, useMemo } from 'react'
import { useCollections } from '@/hooks/useCollections'
import { CollectionList } from '@/components/archive/CollectionList'
import { ArchivedTaskList } from '@/components/archive/ArchivedTaskList'

export default function ArchivePage(): React.JSX.Element {
  const { collections } = useCollections()
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [archivedTasks, setArchivedTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const allCollections = useMemo(() => ['default', ...collections], [collections])

  useEffect(() => {
    const fetchArchived = async () => {
      setLoading(true)
      try {
        const allTasks = await window.api.listTasks()
        const archived = allTasks.filter((t) => t.status === 'archived')
        setArchivedTasks(archived)
      } finally {
        setLoading(false)
      }
    }
    fetchArchived()
  }, [])

  const collectionStats = useMemo(() => {
    const stats: Record<string, number> = {}
    allCollections.forEach(c => stats[c] = 0)
    archivedTasks.forEach(t => {
      const col = t.collection || 'default'
      stats[col] = (stats[col] || 0) + 1
    })
    return stats
  }, [allCollections, archivedTasks])

  const filteredTasks = useMemo(() => {
    if (!selectedCollection) return []
    return archivedTasks.filter(t => (t.collection || 'default') === selectedCollection)
  }, [selectedCollection, archivedTasks])

  return (
    <div className="pb-10">
      {selectedCollection ? (
        <ArchivedTaskList 
          collectionName={selectedCollection}
          tasks={filteredTasks}
          onBack={() => setSelectedCollection(null)}
        />
      ) : (
        <CollectionList 
          collections={allCollections}
          collectionStats={collectionStats}
          onSelectCollection={setSelectedCollection}
        />
      )}
    </div>
  )
}