import { useUIStore } from '@/stores'
import { useCallback } from 'react'

export const useLoading = (key?: string) => {
  const { globalLoading, loadingStates, setGlobalLoading, setLoading } = useUIStore()

  const isLoading = key ? loadingStates[key] || false : globalLoading

  const startLoading = useCallback(() => {
    if (key) {
      setLoading(key, true)
    } else {
      setGlobalLoading(true)
    }
  }, [key, setLoading, setGlobalLoading])

  const stopLoading = useCallback(() => {
    if (key) {
      setLoading(key, false)
    } else {
      setGlobalLoading(false)
    }
  }, [key, setLoading, setGlobalLoading])

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    startLoading()
    try {
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  }
} 