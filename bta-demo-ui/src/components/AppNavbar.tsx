import { Link } from '@tanstack/react-router'

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Pipeline', to: '/pipeline' },
  { label: 'Leads', to: '/leads' },
  { label: 'Estimates', to: '/estimates' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Invoices', to: '/invoices' },
  { label: 'Automation', to: '/automation-log' },
]

export function AppNavbar() {
  return (
    <div className="lg:hidden border-b border-slate-800 bg-slate-900 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <span className="material-icons-outlined text-lg">construction</span>
          </div>
          <div className="text-sm font-semibold">BuildFlow</div>
        </div>
        <div className="flex-1 overflow-x-auto hide-scrollbar">
          <nav className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full border border-slate-800 px-3 py-1.5 hover:text-white"
                activeProps={{ className: 'rounded-full bg-primary text-white px-3 py-1.5' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
