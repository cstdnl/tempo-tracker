import React, { createContext, useContext, useState, ReactNode } from 'react'

interface CollectionContextType {
  selectedCollection: string
  setSelectedCollection: (collection: string) => void
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined)

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [selectedCollection, setSelectedCollection] = useState<string>('all')

  return (
    <CollectionContext.Provider value={{ selectedCollection, setSelectedCollection }}>
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollectionContext() {
  const context = useContext(CollectionContext)
  if (context === undefined) {
    throw new Error('useCollectionContext must be used within a CollectionProvider')
  }
  return context
}