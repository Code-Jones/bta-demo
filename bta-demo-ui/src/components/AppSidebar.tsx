import { useEffect, useMemo, useState } from 'react'

import { Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'
import { useSession } from '../auth/useSession'
import { logout } from '../api/auth'
import { getInitials } from '../utils'

type SidebarUser = {
  name: string
  role: string
  avatarUrl?: string
}

type SidebarUserDisplay = SidebarUser & {
  initials: string
}

type AppSidebarProps = {
  user?: SidebarUser
  defaultCollapsed?: boolean
  collapsible?: boolean
}

const baseSidebarItems = [
  { label: 'Scoreboard', to: '/app/dashboard', icon: 'leaderboard' },
  { label: 'CRM', to: '/app/leads', icon: 'group' },
  { label: 'Pipeline', to: '/app/pipeline', icon: 'assignment' },
  { label: 'Schedule', to: '/app/jobs', icon: 'calendar_today' },
  { label: 'Financials', to: '/app/invoices', icon: 'account_balance_wallet' },
]


export function AppSidebar({
  user,
  defaultCollapsed = false,
  collapsible = true,
}: AppSidebarProps) {
  const navigate = useNavigate()
  useSession()
  const storedUser = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clear)
  const storageKey = 'bta.sidebar.collapsed'
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultCollapsed
    }

    const stored = window.localStorage.getItem(storageKey)
    return stored === null ? defaultCollapsed : stored === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, String(isCollapsed))
    }
  }, [isCollapsed])

  const sidebarUser = useMemo<SidebarUserDisplay>(() => {
    const nameSource = user?.name
    if (nameSource) {
      return { ...user, initials: getInitials(nameSource, 'CO') }
    }

    const firstName = storedUser?.firstName?.trim()
    const lastName = storedUser?.lastName?.trim()
    const displayName = [firstName, lastName ? `${lastName[0]}.` : null]
      .filter(Boolean)
      .join(' ')
    const name = displayName || 'Account Owner'
    const role = storedUser?.company?.trim() || 'Contractor Ops'
    return {
      name,
      role,
      avatarUrl: user?.avatarUrl,
      initials: getInitials(displayName || name, 'CO'),
    }
  }, [storedUser, user])

  const sidebarItems = useMemo(() => {
    const items = [...baseSidebarItems]
    if (storedUser?.isCompanyAdmin === true) {
      items.push({ label: 'Users', to: '/app/organization-users', icon: 'manage_accounts' })
    }
    return items
  }, [storedUser?.isCompanyAdmin])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore logout errors
    } finally {
      clearAuth()
      navigate({ to: '/login' })
    }
  }

  return (
    <>
      <aside
        className={`group/sidebar hidden lg:flex shrink-0 h-full min-h-0 flex-col border-r transition-all duration-400 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
          } border-r border-slate-200 bg-white text-slate-900`}
      >
        <div className="flex flex-col w-full min-h-0 flex-1">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 p-2 rounded-lg bg-primary text-white flex items-center justify-center">
              <span className="material-icons-outlined text-xl">analytics</span>
            </div>
            <span
              className={`text-xl font-bold tracking-tight transition-all ${isCollapsed ? 'opacity-0 w-0 translate-x-2 pointer-events-none' : 'opacity-100'
                }`}
            >
              ContractorOS
            </span>
            {collapsible ? (
              <button
                type="button"
                className={`btn btn-ghost bg-transparent border-none shadow-none btn-xs ml-auto transition-opacity duration-400 opacity-0 group-hover/sidebar:opacity-100 group-hover/sidebar:pointer-events-auto text-slate-500 hover:text-slate-600`}
                aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
                onClick={() => setIsCollapsed((prev) => !prev)}
              >
                <span className="material-symbols-outlined text-lg">
                  {isCollapsed ? 'chevron_right' : 'chevron_left'}
                </span>
              </button>
            ) : null}
          </div>
          <nav className="flex-1 px-4 space-y-1 mt-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-50 ${isCollapsed ? 'justify-center' : ''
                  }`}
                activeProps={{
                  className: `flex items-center gap-3 px-3 py-2 rounded-lg font-semibold bg-slate-100 text-primary ${isCollapsed ? 'justify-center' : ''
                    }`,
                }}
                title={item.label}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span
                  className={`text-sm transition-all ${isCollapsed ? 'opacity-0 w-0 translate-x-2 pointer-events-none' : 'opacity-100'
                    }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className={`p-4 border-t border-slate-200`}>
            <div className={`flex items-center gap-3 p-2 ${isCollapsed ? 'justify-center' : ''}`}>
              {sidebarUser.avatarUrl ? (
                <img
                  alt={`${sidebarUser.name} avatar`}
                  className="w-9 h-9 rounded-full object-cover"
                  src={sidebarUser.avatarUrl}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold">
                  {sidebarUser.initials}
                </div>
              )}
              <div
                className={`overflow-hidden transition-all ${isCollapsed ? 'opacity-0 w-0 translate-x-2 pointer-events-none' : 'opacity-100'
                  }`}
              >
                <p className="text-xs font-semibold truncate">{sidebarUser.name}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  {sidebarUser.role}
                </p>
              </div>
            </div>
            <button
              type="button"
              className={`mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
              onClick={handleLogout}
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className={`${isCollapsed ? 'hidden' : ''}`}>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      <aside className={`lg:hidden w-16 shrink-0 h-full border-r border-slate-200 bg-white text-slate-900`}>
        <div className="flex flex-col h-full items-center py-4">
          <button
            type="button"
            className="mb-4 h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center"
            aria-label="Open navigation"
            onClick={() => setIsMobileOpen(true)}
          >
            <span className="material-symbols-outlined text-lg">menu</span>
          </button>
          <div className="flex-1 flex flex-col items-center gap-3">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors text-slate-600 hover:bg-slate-50`}
                activeProps={{
                  className: `h-10 w-10 rounded-lg flex items-center justify-center bg-slate-100 text-primary`,
                }}
                title={item.label}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {isMobileOpen ? (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40"
          aria-label="Close navigation"
          onClick={() => setIsMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 border-r transition-transform duration-200 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-slate-200 bg-white text-slate-900`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 p-2 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
            <span className="material-icons-outlined text-xl">analytics</span>
          </div>
          <span className="text-xl font-bold tracking-tight">ContractorOS</span>
          <button
            type="button"
            className={`btn btn-ghost bg-transparent border-none shadow-none btn-xs ml-auto text-slate-500`}
            aria-label="Close navigation"
            onClick={() => setIsMobileOpen(false)}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-50`}
              activeProps={{
                className: `flex items-center gap-3 px-3 py-2 rounded-lg font-semibold bg-slate-100 text-primary`,
              }}
              onClick={() => setIsMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={`p-4 border-t border-slate-200`}>
          <div className="flex items-center gap-3 p-2">
            {sidebarUser.avatarUrl ? (
              <img
                alt={`${sidebarUser.name} avatar`}
                className="w-9 h-9 rounded-full object-cover"
                src={sidebarUser.avatarUrl}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold">
                {sidebarUser.initials}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">{sidebarUser.name}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                {sidebarUser.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
