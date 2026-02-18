import { createFileRoute, redirect } from '@tanstack/react-router'
import { OrganizationUsersPage } from '../pages/organization/OrganizationUsersPage'
import { getAuthMe } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { mapMeToAuthUser } from '../auth/sessionUtils'

export const Route = createFileRoute('/app/organization-users')({
  beforeLoad: async () => {
    const { user, setUser } = useAuthStore.getState()
    if (user?.isCompanyAdmin === true) {
      return
    }

    if (user && user.isCompanyAdmin === false) {
      throw redirect({ to: '/app/dashboard' })
    }

    const res = await getAuthMe()
    if (!res?.userId) {
      throw redirect({ to: '/login' })
    }

    const normalizedUser = mapMeToAuthUser(res)
    setUser(normalizedUser)

    if (!normalizedUser.isCompanyAdmin) {
      throw redirect({ to: '/app/dashboard' })
    }
  },
  component: OrganizationUsersPage,
})
