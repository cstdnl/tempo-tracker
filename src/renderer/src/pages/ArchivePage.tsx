import React, { useState, useEffect, useMemo } from 'react'
import { useCollections } from '@/hooks/useCollections'
import { CollectionList } from '@/components/archive/CollectionList'
import { ArchivedTaskList } from '@/components/archive/ArchivedTaskList'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Separator } from '@renderer/components/ui/separator'

export default function ArchivePage(): React.JSX.Element {
  const { collections } = useCollections()
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [archivedTasks, setArchivedTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const allCollections = useMemo(() => ['default', ...collections], [collections])

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

  useEffect(() => {
    fetchArchived()
  }, [])

  const handleRestoreTask = async (taskId: number) => {
    await window.api.updateTaskStatus(taskId, 'active')
    await fetchArchived()
  }

  const handleDeleteTask = async (taskId: number) => {
    await window.api.deleteTask(taskId)
    await fetchArchived()
  }

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
    <div className="flex-1 flex flex-col min-h-0 fade-in duration-300">
      {/* Header */}
      <div className="px-6 py-4 backdrop-blur-sm z-20">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold tracking-tight">Archive</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            {selectedCollection 
              ? `Viewing tasks from ${selectedCollection}`
              : "Review your archived tasks by collection"
            }
          </p>
        </div>
      </div>
      
      <Separator className="w-full bg-muted-foreground/70 opacity-50" />

      {/* Scrollable Content Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-2xl py-8 px-2 space-y-8 animate-in fade-in duration-500">
            {selectedCollection ? (
              <ArchivedTaskList 
                collectionName={selectedCollection}
                tasks={filteredTasks}
                onRestore={handleRestoreTask}
                onDelete={handleDeleteTask}
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
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 backdrop-blur-sm z-20 flex flex-col items-center gap-2 opacity-50">
        <Separator className="w-full bg-muted-foreground/70" />
        <div className="flex items-center pt-2 gap-4 text-[10px] font-medium uppercase tracking-widest">
          <span>Tracker v1.0.0</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>Archived Tasks</span>
        </div>
      </div>
    </div>
  )
}