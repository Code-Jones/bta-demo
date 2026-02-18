import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import { useAuthStore } from '../store/authStore'
import { queryKeys } from '../api/queryKeys'
import { type MeResponse } from '../api/types'
import { mapMeToAuthUser } from './sessionUtils'

export function useSession() {
  const token = useAuthStore((state) => state.token)
  const setUser = useAuthStore((state) => state.setUser)

  useQuery({
    queryKey: queryKeys.auth.me(),
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      const res = await apiFetch<MeResponse>('/auth/me')
      if (!res?.userId) {
        throw new Error('Unauthorized')
      }
      setUser(mapMeToAuthUser(res))
      return true
    },
  })
}
