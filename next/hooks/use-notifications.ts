import { useUIStore } from '@/stores'
import { useCallback } from 'react'

export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useUIStore()

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration,
    })
  }, [addNotification])

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration,
    })
  }, [addNotification])

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration,
    })
  }, [addNotification])

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration,
    })
  }, [addNotification])

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications,
  }
} 