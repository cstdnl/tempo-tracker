import { useState, useEffect, useCallback } from 'react'

export function useCollections() {
  const [collections, setCollections] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true)
      const list = await window.api.listCollections()
      setCollections(list || [])
    } catch (error) {
      console.error('Failed to load collections:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const addCollection = async (name: string) => {
    if (!name || name.trim() === '') return
    const trimmed = name.trim().toLowerCase()
    // "all" and "default" are reserved UI keywords
    if (trimmed === 'all' || trimmed === 'default') return
    
    try {
      await window.api.addCollection(trimmed)
      await loadCollections()
    } catch (error) {
      console.error('Failed to add collection:', error)
    }
  }

  const deleteCollection = async (name: string) => {
    try {
      await window.api.deleteCollection(name)
      await loadCollections()
    } catch (error) {
      console.error('Failed to delete collection:', error)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  return {
    collections,
    loading,
    addCollection,
    deleteCollection,
    refreshCollections: loadCollections
  }
}