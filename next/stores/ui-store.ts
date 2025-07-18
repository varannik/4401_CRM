import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface Modal {
  id: string
  component: string
  props?: Record<string, any>
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

interface UIState {
  // Theme
  theme: Theme
  
  // Loading states
  globalLoading: boolean
  loadingStates: Record<string, boolean>
  
  // Notifications
  notifications: Notification[]
  
  // Modals
  modals: Modal[]
  
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Actions
  setTheme: (theme: Theme) => void
  setGlobalLoading: (loading: boolean) => void
  setLoading: (key: string, loading: boolean) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  openModal: (modal: Omit<Modal, 'id'>) => void
  closeModal: (id: string) => void
  closeAllModals: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  toggleSidebarCollapse: () => void
}

const initialState = {
  theme: 'system' as Theme,
  globalLoading: false,
  loadingStates: {},
  notifications: [],
  modals: [],
  sidebarOpen: true,
  sidebarCollapsed: false,
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setTheme: (theme) => set(
          () => ({ theme }),
          false,
          'ui/setTheme'
        ),
        
        setGlobalLoading: (globalLoading) => set(
          () => ({ globalLoading }),
          false,
          'ui/setGlobalLoading'
        ),
        
        setLoading: (key, loading) => set(
          (state) => ({
            loadingStates: {
              ...state.loadingStates,
              [key]: loading,
            },
          }),
          false,
          'ui/setLoading'
        ),
        
        addNotification: (notification) => {
          const id = Math.random().toString(36).substr(2, 9)
          const newNotification = { ...notification, id }
          
          set(
            (state) => ({
              notifications: [...state.notifications, newNotification],
            }),
            false,
            'ui/addNotification'
          )
          
          // Auto-remove notification after duration
          if (notification.duration !== 0) {
            setTimeout(() => {
              get().removeNotification(id)
            }, notification.duration || 5000)
          }
        },
        
        removeNotification: (id) => set(
          (state) => ({
            notifications: state.notifications.filter(n => n.id !== id),
          }),
          false,
          'ui/removeNotification'
        ),
        
        clearNotifications: () => set(
          () => ({ notifications: [] }),
          false,
          'ui/clearNotifications'
        ),
        
        openModal: (modal) => {
          const id = Math.random().toString(36).substr(2, 9)
          const newModal = { ...modal, id }
          
          set(
            (state) => ({
              modals: [...state.modals, newModal],
            }),
            false,
            'ui/openModal'
          )
        },
        
        closeModal: (id) => set(
          (state) => ({
            modals: state.modals.filter(m => m.id !== id),
          }),
          false,
          'ui/closeModal'
        ),
        
        closeAllModals: () => set(
          () => ({ modals: [] }),
          false,
          'ui/closeAllModals'
        ),
        
        setSidebarOpen: (sidebarOpen) => set(
          () => ({ sidebarOpen }),
          false,
          'ui/setSidebarOpen'
        ),
        
        setSidebarCollapsed: (sidebarCollapsed) => set(
          () => ({ sidebarCollapsed }),
          false,
          'ui/setSidebarCollapsed'
        ),
        
        toggleSidebar: () => set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          'ui/toggleSidebar'
        ),
        
        toggleSidebarCollapse: () => set(
          (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
          false,
          'ui/toggleSidebarCollapse'
        ),
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
) 