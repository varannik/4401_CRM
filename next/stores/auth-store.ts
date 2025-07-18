import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken?: string
  idToken?: string
  
  // Actions
  setUser: (user: User | null) => void
  setTokens: (accessToken?: string, idToken?: string) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  reset: () => void
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: undefined,
  idToken: undefined,
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setUser: (user) => set(
          (state) => ({
            user,
            isAuthenticated: !!user,
          }),
          false,
          'auth/setUser'
        ),
        
        setTokens: (accessToken, idToken) => set(
          (state) => ({
            accessToken,
            idToken,
          }),
          false,
          'auth/setTokens'
        ),
        
        setLoading: (isLoading) => set(
          (state) => ({ isLoading }),
          false,
          'auth/setLoading'
        ),
        
        logout: () => set(
          () => ({
            user: null,
            isAuthenticated: false,
            accessToken: undefined,
            idToken: undefined,
            isLoading: false,
          }),
          false,
          'auth/logout'
        ),
        
        reset: () => set(
          () => initialState,
          false,
          'auth/reset'
        ),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
) 