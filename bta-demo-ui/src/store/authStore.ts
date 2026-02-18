import { create } from 'zustand'

type User = {
  userId: string
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  organizationId?: string | null
  organizationName?: string | null
  isCompanyAdmin?: boolean | null
}

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'

type AuthStore = {
  token: string | null
  refreshToken: string | null
  user: User | null
  setToken: (token: string | null, preserveRefreshToken?: boolean) => void
  setTokens: (token: string, refreshToken: string) => void
  setUser: (user: User | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  user: null,
  setToken: (token: string | null, preserveRefreshToken = true) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
      if (!preserveRefreshToken) {
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        set({ token, refreshToken: null })
      } else {
        set({ token })
      }
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      set({ token: null, refreshToken: null, user: null })
    }
  },
  setTokens: (token: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    set({ token, refreshToken })
  },
  setUser: (user: User | null) => set({ user }),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    set({ token: null, refreshToken: null, user: null })
  },
}))
