import { Outlet, createRootRoute } from '@tanstack/react-router'
import { NotFoundPage } from '../pages/404/NotFoundPage'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

function RootLayout() {
  return <Outlet />
}
