import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface DataItem {
  id: string
  title: string
  description?: string
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'inactive' | 'pending'
  metadata?: Record<string, any>
}

interface DataState {
  // Data
  items: DataItem[]
  selectedItem: DataItem | null
  
  // Filters and search
  searchQuery: string
  filters: {
    status?: 'active' | 'inactive' | 'pending'
    dateRange?: {
      start: Date
      end: Date
    }
  }
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  totalItems: number
  
  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // Actions
  setItems: (items: DataItem[]) => void
  addItem: (item: DataItem) => void
  updateItem: (id: string, updates: Partial<DataItem>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: DataItem | null) => void
  setSearchQuery: (query: string) => void
  setFilters: (filters: Partial<DataState['filters']>) => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setTotalItems: (count: number) => void
  setLoading: (loading: boolean) => void
  setCreating: (creating: boolean) => void
  setUpdating: (updating: boolean) => void
  setDeleting: (deleting: boolean) => void
  clearFilters: () => void
  reset: () => void
}

const initialState = {
  items: [],
  selectedItem: null,
  searchQuery: '',
  filters: {},
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
}

export const useDataStore = create<DataState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setItems: (items) => set(
        () => ({ items }),
        false,
        'data/setItems'
      ),
      
      addItem: (item) => set(
        (state) => ({
          items: [item, ...state.items],
          totalItems: state.totalItems + 1,
        }),
        false,
        'data/addItem'
      ),
      
      updateItem: (id, updates) => set(
        (state) => ({
          items: state.items.map(item =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          ),
          selectedItem: state.selectedItem?.id === id
            ? { ...state.selectedItem, ...updates, updatedAt: new Date() }
            : state.selectedItem,
        }),
        false,
        'data/updateItem'
      ),
      
      removeItem: (id) => set(
        (state) => ({
          items: state.items.filter(item => item.id !== id),
          selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
          totalItems: Math.max(0, state.totalItems - 1),
        }),
        false,
        'data/removeItem'
      ),
      
      setSelectedItem: (selectedItem) => set(
        () => ({ selectedItem }),
        false,
        'data/setSelectedItem'
      ),
      
      setSearchQuery: (searchQuery) => set(
        () => ({ searchQuery, currentPage: 1 }),
        false,
        'data/setSearchQuery'
      ),
      
      setFilters: (newFilters) => set(
        (state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1,
        }),
        false,
        'data/setFilters'
      ),
      
      setCurrentPage: (currentPage) => set(
        () => ({ currentPage }),
        false,
        'data/setCurrentPage'
      ),
      
      setItemsPerPage: (itemsPerPage) => set(
        () => ({ itemsPerPage, currentPage: 1 }),
        false,
        'data/setItemsPerPage'
      ),
      
      setTotalItems: (totalItems) => set(
        () => ({ totalItems }),
        false,
        'data/setTotalItems'
      ),
      
      setLoading: (isLoading) => set(
        () => ({ isLoading }),
        false,
        'data/setLoading'
      ),
      
      setCreating: (isCreating) => set(
        () => ({ isCreating }),
        false,
        'data/setCreating'
      ),
      
      setUpdating: (isUpdating) => set(
        () => ({ isUpdating }),
        false,
        'data/setUpdating'
      ),
      
      setDeleting: (isDeleting) => set(
        () => ({ isDeleting }),
        false,
        'data/setDeleting'
      ),
      
      clearFilters: () => set(
        () => ({ filters: {}, searchQuery: '', currentPage: 1 }),
        false,
        'data/clearFilters'
      ),
      
      reset: () => set(
        () => initialState,
        false,
        'data/reset'
      ),
    }),
    {
      name: 'data-store',
    }
  )
) 