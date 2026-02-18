import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getAuthMe } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { mapMeToAuthUser } from '../auth/sessionUtils'

export const Route = createFileRoute('/app')({
    beforeLoad: async () => {
        const { token, refreshToken, setUser } = useAuthStore.getState()
        const storedToken = token ?? localStorage.getItem('token')
        const storedRefreshToken = refreshToken ?? localStorage.getItem('refreshToken')
        if (!storedToken && !storedRefreshToken) {
            throw redirect({ to: '/login' })
        }
        try {
            const res = await getAuthMe()
            if (!res?.userId) {
                throw redirect({ to: '/login' })
            }
            setUser(mapMeToAuthUser(res))
        } catch {
            throw redirect({ to: '/login' })
        }
    },
    component: AppLayout,
})

function AppLayout() {
    return (
        <Outlet />
    )
}
