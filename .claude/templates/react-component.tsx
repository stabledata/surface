import React from 'react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Define the component props interface
interface {{ComponentName}}Props {
  className?: string
  // Add your props here
}

// Main component
export function {{ComponentName}}({ className, ...props }: {{ComponentName}}Props) {
  // State management
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Effects
  useEffect(() => {
    // Add your effects here
  }, [])

  // Event handlers
  const handleAction = () => {
    // Add your event handling logic
  }

  // Render loading state
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className={cn('text-center p-4 text-red-600', className)}>
        <p>Error: {error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    )
  }

  // Main render
  return (
    <div className={cn('{{componentName}}-container', className)} {...props}>
      {/* Add your component content here */}
      <h2 className="text-xl font-semibold mb-4">{{ComponentName}}</h2>

      <div className="space-y-4">
        {/* Example content */}
        <p className="text-gray-600">
          This is a template component. Replace this content with your actual implementation.
        </p>

        <button
          onClick={handleAction}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Action Button
        </button>
      </div>
    </div>
  )
}

// Sub-components (if needed)
interface {{ComponentName}}ItemProps {
  item: any // Replace with your item type
  onSelect?: (item: any) => void
}

export function {{ComponentName}}Item({ item, onSelect }: {{ComponentName}}ItemProps) {
  return (
    <div
      className="p-3 border rounded cursor-pointer hover:bg-gray-50"
      onClick={() => onSelect?.(item)}
    >
      {/* Add item rendering logic */}
      <span>{item?.name || 'Item'}</span>
    </div>
  )
}

// Hook for component logic (if complex state management is needed)
export function use{{ComponentName}}() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Add your data fetching logic here
      // const response = await api.{{resourceName}}.$get()
      // setData(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const create = async (newItem: any) => {
    try {
      // Add creation logic
      // const response = await api.{{resourceName}}.$post({ json: newItem })
      // const created = await response.json()
      // setData(prev => [...prev, created])
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
      return false
    }
  }

  const update = async (id: string, updates: any) => {
    try {
      // Add update logic
      // const response = await api.{{resourceName}}[':id'].$put({
      //   param: { id },
      //   json: updates
      // })
      // const updated = await response.json()
      // setData(prev => prev.map(item => item.id === id ? updated : item))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
      return false
    }
  }

  const remove = async (id: string) => {
    try {
      // Add deletion logic
      // await api.{{resourceName}}[':id'].$delete({ param: { id } })
      // setData(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
      return false
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    fetchData,
    create,
    update,
    remove
  }
}

// Export types for external use
export type { {{ComponentName}}Props, {{ComponentName}}ItemProps }
