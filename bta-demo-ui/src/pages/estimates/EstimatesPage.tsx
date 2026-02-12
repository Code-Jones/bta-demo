import { AppSidebar } from '../../components/AppSidebar'
import { appSidebarBrand, appSidebarItems } from '../../components/appSidebarConfig'
import { appUser } from '../../data/appUser'

const estimates = [
  {
    initials: 'RC',
    name: 'Robert Chen',
    project: 'Kitchen Tile Remodel',
    amount: '$4,250.00',
    status: 'Sent',
    statusTone: 'bg-blue-100 text-blue-700',
    created: 'Oct 24, 2023',
  },
  {
    initials: 'SJ',
    name: 'Sarah Jenkins',
    project: 'Backyard Lighting Install',
    amount: '$1,800.00',
    status: 'Accepted',
    statusTone: 'bg-green-100 text-green-700',
    created: 'Oct 22, 2023',
  },
  {
    initials: 'MK',
    name: 'Mark Thompson',
    project: 'Full House Repiping',
    amount: '$12,400.00',
    status: 'Draft',
    statusTone: 'bg-slate-100 text-slate-700',
    created: 'Oct 21, 2023',
  },
  {
    initials: 'AL',
    name: 'Amanda Lee',
    project: 'Deck Repair & Stain',
    amount: '$3,150.00',
    status: 'Declined',
    statusTone: 'bg-red-100 text-red-700',
    created: 'Oct 19, 2023',
  },
]

export function EstimatesPage() {
  return (
    <div className="bg-background-light text-slate-900">
      <div className="flex min-h-screen">
        <AppSidebar
          brand={appSidebarBrand}
          items={appSidebarItems}
          user={appUser}
        />
        <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center flex-1 max-w-xl">
              <div className="relative w-full">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Search estimates, customers, or projects..."
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/5 text-slate-500">
                <span className="material-icons">notifications</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/5 text-slate-500">
                <span className="material-icons">settings</span>
              </button>
            </div>
          </header>

          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">Estimate Management</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Manage your sales pipeline and track project quotes.
                </p>
              </div>
              <button className="btn bg-primary text-white hover:bg-primary/90 gap-2 shadow-sm shadow-primary/20">
                <span className="material-icons text-sm">add</span>
                New Estimate
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <StatCard
                icon="pending_actions"
                label="Total Pending"
                value="$12,450.00"
                tone="text-blue-600"
              />
              <StatCard
                icon="check_circle"
                label="Accepted This Month"
                value="24 Estimates"
                tone="text-green-600"
              />
              <StatCard
                icon="trending_up"
                label="Conversion Rate"
                value="68%"
                tone="text-primary"
              />
            </div>

            <div className="bg-white rounded-t-xl border border-b-0 border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <button className="px-4 py-1.5 text-xs font-medium bg-primary text-white">All</button>
                  <button className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:bg-primary/5">
                    Draft
                  </button>
                  <button className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:bg-primary/5">
                    Sent
                  </button>
                  <button className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:bg-primary/5">
                    Accepted
                  </button>
                </div>
                <button className="flex items-center gap-2 text-xs font-medium text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-primary/5">
                  <span className="material-icons text-sm">calendar_today</span>
                  Last 30 Days
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sort by:</span>
                <button className="text-xs font-semibold flex items-center gap-1">
                  Date Created
                  <span className="material-icons text-sm">arrow_downward</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-b-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Customer &amp; Project
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {estimates.map((estimate) => (
                    <tr key={estimate.name} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                            {estimate.initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{estimate.name}</div>
                            <div className="text-xs text-slate-500">{estimate.project}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold">{estimate.amount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estimate.statusTone}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                          {estimate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{estimate.created}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors">
                          <span className="material-icons">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Showing 1 to 4 of 24 estimates
                </span>
                <div className="flex gap-2">
                  <button className="p-2 rounded border border-slate-200 hover:bg-primary/5 disabled:opacity-50" disabled>
                    <span className="material-icons text-sm">chevron_left</span>
                  </button>
                  <button className="p-2 rounded border border-slate-200 hover:bg-primary/5">
                    <span className="material-icons text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl border-l border-slate-200">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Estimate #EST-2023-042</h2>
                  <p className="text-xs text-slate-500">Created on Oct 24, 2023</p>
                </div>
                <button className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                  <span className="material-icons text-slate-500">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-8 flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600">
                      <span className="material-icons">outgoing_mail</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-800 block">STATUS: SENT</span>
                      <span className="text-[10px] text-blue-600">Customer viewed 2h ago</span>
                    </div>
                  </div>
                  <button className="text-xs font-semibold text-blue-600 hover:underline">View History</button>
                </div>

                <section className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Customer Information
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="font-bold text-sm">Robert Chen</div>
                      <div className="text-sm text-slate-500 mt-1">
                        482 Oakwood Ave, San Francisco, CA
                      </div>
                      <div className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
                        <span className="material-icons text-xs">phone</span>
                        +1 (555) 012-3456
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Estimate Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Materials Total</span>
                        <span className="font-medium">$2,450.00</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Labor &amp; Equipment</span>
                        <span className="font-medium">$1,600.00</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Estimated Permits</span>
                        <span className="font-medium">$200.00</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                        <span className="font-bold">Grand Total</span>
                        <span className="text-xl font-extrabold text-primary">$4,250.00</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Job Photos</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <img
                          alt="Job site"
                          className="w-full h-full object-cover opacity-80"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAizqyJnJk3oMAFhW3o-5ospfYthWXt-cFv0nZJsly9SH-pqNl6uH7JJJfYq8upnVJjgpFKjcT21E84cYTGmOEOd_NWIKrBHkFby8TK-A6uU24_vQp9xf-pd1yLRK8P-VQFRtLI_qIkReIhniEtH_q-6tGx26bfngPc29RiP6T_ef5dIEDiXwAxVkoeY0Mj2mVOBXqwNb9M7NWqDkjNXgo7ZQfGXU-PJHp9bYzXzKO52GAF_taatUB7w1z5idO0m0Fl4vX4WPUPLmA"
                        />
                      </div>
                      <div className="h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative">
                        <img
                          alt="Materials"
                          className="w-full h-full object-cover opacity-80"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7vYTSlwPcNFeeOX3noWF_gQYGv2jRAFp1gzt6Itx9NqWXLks3gTRoqiu6_UqA9TS9Zr6zUiwFGSDjLBGt9_OOgzSxDhY0hLbT9sYYoepp16nYYR1j7oQtIAD2ZrQ-iZtTafI4c-BRYvzKdiHeoWa1BLSUV2Th0BtRLrJww-pibGVmQgUbyu9dmIZmaRwBlVaUBoPkFofbLP2pFOP84yBM05IwkZhr8nFeuCGbpJ9TvxWzwH72fO1RCF0OtrgC4cb4Iu_B0_wMsAY"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">+3 Photos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    <span className="material-icons text-sm">send</span>
                    Resend to Customer
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="w-full border border-green-500 text-green-600 py-2.5 rounded-lg text-xs font-bold hover:bg-green-50">
                    MARK ACCEPTED
                  </button>
                  <button className="w-full border border-red-500 text-red-600 py-2.5 rounded-lg text-xs font-bold hover:bg-red-50">
                    MARK DECLINED
                  </button>
                </div>
                <button className="w-full mt-4 text-slate-500 text-xs font-medium hover:text-primary transition-colors flex items-center justify-center gap-1">
                  <span className="material-icons text-sm">edit</span>
                  Edit Full Estimate Details
                </button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: string
  label: string
  value: string
  tone: string
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex-1 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center ${tone}`}>
        <span className="material-icons text-lg">{icon}</span>
      </div>
      <div>
        <span className="text-xs text-slate-500 font-medium block">{label}</span>
        <span className="text-lg font-bold">{value}</span>
      </div>
    </div>
  )
}
