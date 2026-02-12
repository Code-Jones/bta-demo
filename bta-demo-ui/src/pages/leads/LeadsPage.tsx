import { AppSidebar } from '../../components/AppSidebar'
import { appSidebarBrand, appSidebarItems } from '../../components/appSidebarConfig'
import { appUser } from '../../data/appUser'

const leadRows = [
  {
    initials: 'JD',
    name: 'John Doe',
    company: 'Doe & Sons Construction',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    created: 'Oct 24, 2023',
    status: 'New Lead',
    statusTone: 'bg-blue-100 text-blue-800',
  },
  {
    initials: 'SM',
    name: 'Sarah Miller',
    company: 'Miller Heights Properties',
    email: 'sarah.m@millerheights.com',
    phone: '(555) 987-6543',
    created: 'Oct 21, 2023',
    status: 'Contacted',
    statusTone: 'bg-emerald-100 text-emerald-800',
  },
  {
    initials: 'RB',
    name: 'Robert Brown',
    company: 'Brown Residential',
    email: 'robert@brownres.net',
    phone: '(555) 444-5566',
    created: 'Oct 18, 2023',
    status: 'In Progress',
    statusTone: 'bg-amber-100 text-amber-800',
  },
  {
    initials: 'EW',
    name: 'Emily Wilson',
    company: 'Private Client',
    email: 'e.wilson@webmail.com',
    phone: '(555) 222-3311',
    created: 'Sep 30, 2023',
    status: 'Inactive',
    statusTone: 'bg-slate-100 text-slate-600',
  },
]

export function LeadsPage() {
  return (
    <div className="bg-background-light text-slate-900">
      <div className="flex min-h-screen">
        <AppSidebar
          brand={appSidebarBrand}
          items={appSidebarItems}
          user={appUser}
        />
        <main className="flex-1 p-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">Leads &amp; Customer Management</h1>
              <p className="text-slate-500 text-sm">
                Manage your pipeline and customer relationships in one place.
              </p>
            </div>
            <button className="btn bg-primary text-white hover:bg-primary/90 gap-2 shadow-md shadow-primary/20">
              <span className="material-icons">add</span>
              Add New Lead
            </button>
          </header>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Search by name, email or company..."
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <select className="bg-slate-50 border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-primary text-slate-600">
                <option>All Statuses</option>
                <option>New Lead</option>
                <option>Contacted</option>
                <option>In Progress</option>
                <option>Inactive</option>
              </select>
              <select className="bg-slate-50 border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-primary text-slate-600">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Year to Date</option>
                <option>Custom Range</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                <span className="material-icons text-lg">file_download</span>
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Client / Company
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Contact Details
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leadRows.map((row) => (
                    <tr
                      key={row.email}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {row.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{row.name}</p>
                            <p className="text-xs text-slate-500">{row.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="material-icons text-base">email</span>
                            <span>{row.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="material-icons text-base">phone</span>
                            <span>{row.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-slate-600">
                        {row.created}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.statusTone}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <span className="material-icons">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-900">1</span> to{' '}
                <span className="font-medium text-slate-900">4</span> of{' '}
                <span className="font-medium text-slate-900">1,240</span> results
              </p>
              <div className="flex gap-2">
                <button
                  className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  disabled
                >
                  <span className="material-icons text-base">chevron_left</span>
                </button>
                <button className="px-3 py-1 bg-primary text-white text-sm font-medium rounded">
                  1
                </button>
                <button className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded">
                  2
                </button>
                <button className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded">
                  3
                </button>
                <button className="p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <span className="material-icons text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <StatTile
              label="New Leads This Month"
              value="48"
              trend="+12%"
              icon="trending_up"
              tone="text-primary"
            />
            <StatTile
              label="Active Pipelines"
              value="156"
              trend="+4%"
              icon="assignment_turned_in"
              tone="text-emerald-600"
            />
            <StatTile
              label="Conversion Rate"
              value="24.8%"
              trend="Steady"
              icon="pie_chart"
              tone="text-amber-600"
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  trend,
  icon,
  tone,
}: {
  label: string
  value: string
  trend: string
  icon: string
  tone: string
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-sm font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center ${tone}`}>
          <span className="material-icons text-lg">{icon}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        <span className="text-emerald-500 text-xs font-semibold">{trend}</span>
      </div>
    </div>
  )
}
