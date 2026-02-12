import { AppSidebar } from '../../components/AppSidebar'
import { appSidebarBrand, appSidebarItems } from '../../components/appSidebarConfig'
import { appUser } from '../../data/appUser'

const jobRows = [
  {
    customer: 'Riverside Apartment Complex',
    address: '1200 Riverside Dr, Apt 4B',
    estimateId: '#EST-2045',
    scheduledDate: 'Oct 26, 2023',
    scheduledWindow: '09:00 AM - 11:30 AM',
    status: 'In Progress',
    statusTone: 'bg-amber-100 text-amber-700',
  },
  {
    customer: 'Sarah Jenkins',
    address: '45 Oak Street, Downtown',
    estimateId: '#EST-2102',
    scheduledDate: 'Oct 26, 2023',
    scheduledWindow: '01:30 PM - 03:00 PM',
    status: 'Scheduled',
    statusTone: 'bg-primary/10 text-primary',
    highlight: true,
  },
  {
    customer: 'Golden Harvest Co.',
    address: 'Warehouse 7, Port Authority',
    estimateId: '#EST-1988',
    scheduledDate: 'Oct 25, 2023',
    scheduledWindow: 'Completed yesterday',
    status: 'Completed',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    customer: 'Michael Thorne',
    address: '882 Westview Dr',
    estimateId: '#EST-2150',
    scheduledDate: 'Oct 27, 2023',
    scheduledWindow: '10:00 AM - 12:00 PM',
    status: 'Scheduled',
    statusTone: 'bg-primary/10 text-primary',
  },
]

export function JobsPage() {
  return (
    <div className="bg-background-light text-slate-900">
      <div className="flex h-screen overflow-hidden">
        <AppSidebar
          brand={appSidebarBrand}
          items={appSidebarItems}
          user={appUser}
        />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold">Job Tracking</h2>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                12 Jobs Today
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  search
                </span>
                <input
                  className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all w-64 outline-none"
                  placeholder="Search jobs, customers..."
                />
              </div>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative">
                <span className="material-icons-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="btn btn-sm bg-primary text-white hover:bg-primary/90 gap-2 shadow-sm shadow-primary/20">
                <span className="material-icons-outlined text-sm">add</span>
                New Job
              </button>
            </div>
          </header>

          <div className="px-8 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
              <button className="px-4 py-1.5 text-sm font-semibold bg-primary text-white rounded-md flex items-center gap-2">
                <span className="material-icons-outlined text-sm">list</span>
                List View
              </button>
              <button className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md flex items-center gap-2">
                <span className="material-icons-outlined text-sm">calendar_month</span>
                Calendar
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                <span className="material-icons-outlined text-sm">event</span>
                Oct 24 - Oct 30, 2023
                <span className="material-icons-outlined text-sm">keyboard_arrow_down</span>
              </div>
              <button className="p-2 text-slate-600 bg-white rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50">
                <span className="material-icons-outlined text-sm">tune</span>
              </button>
            </div>
          </div>

          <div className="flex-1 px-8 pb-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Customer</th>
                        <th className="px-6 py-4 font-semibold">Estimate</th>
                        <th className="px-6 py-4 font-semibold">Scheduled Date</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jobRows.map((row) => (
                        <tr
                          key={row.customer}
                          className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                            row.highlight ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{row.customer}</span>
                              <span className="text-xs text-slate-500">{row.address}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-primary hover:underline underline-offset-4">
                              {row.estimateId}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{row.scheduledDate}</span>
                              <span className="text-xs text-slate-500">{row.scheduledWindow}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.statusTone}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                              <span className="material-icons-outlined text-sm">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing 4 of 12 jobs</span>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50">
                        Previous
                      </button>
                      <button className="px-3 py-1 rounded bg-primary text-white font-medium">1</button>
                      <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50">2</button>
                      <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50">Next</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-lg mb-1">Riverside Apartment Complex</h3>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span className="material-icons-outlined text-sm">location_on</span>
                        1200 Riverside Dr, Apt 4B
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-tight">
                      Active
                    </span>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Job Progression
                      </p>
                      <div className="relative flex items-center justify-between">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
                        <div className="absolute top-1/2 left-0 w-1/2 h-1 bg-primary -translate-y-1/2"></div>
                        <ProgressStep label="Scheduled" active icon="check" />
                        <ProgressStep label="In Progress" active pulse />
                        <ProgressStep label="Completed" icon="flag" muted />
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold">Total Completion</span>
                        <span className="text-sm font-bold text-primary">60%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        <span className="material-icons-outlined text-sm">phone</span>
                        Call Client
                      </button>
                      <button className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        <span className="material-icons-outlined text-sm">map</span>
                        Directions
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Work Log</p>
                      <div className="space-y-4">
                        <WorkLogEntry
                          icon="history_edu"
                          time="09:12 AM"
                          description="Job started by Tom Harris"
                        />
                        <WorkLogEntry
                          icon="photo_camera"
                          time="10:05 AM"
                          description="Added 4 photos to gallery"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm">Schedule Overview</h3>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                        <span className="material-icons-outlined text-sm">chevron_left</span>
                      </button>
                      <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                        <span className="material-icons-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase mb-2">
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                    <span>S</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['23', '24', '25'].map((day) => (
                      <span key={day} className="py-2 text-xs text-slate-300">
                        {day}
                      </span>
                    ))}
                    <span className="py-2 text-xs bg-primary text-white rounded-lg font-bold">26</span>
                    {['27', '28', '29', '30', '31'].map((day) => (
                      <span
                        key={day}
                        className="py-2 text-xs font-medium hover:bg-slate-100 rounded cursor-pointer"
                      >
                        {day}
                      </span>
                    ))}
                    {['1', '2', '3', '4', '5'].map((day) => (
                      <span key={day} className="py-2 text-xs text-slate-400">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function ProgressStep({
  label,
  icon,
  active,
  pulse,
  muted,
}: {
  label: string
  icon?: string
  active?: boolean
  pulse?: boolean
  muted?: boolean
}) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${
          muted ? 'bg-slate-100 text-slate-400' : active ? 'bg-primary text-white' : 'bg-slate-100'
        }`}
      >
        {pulse ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> : null}
        {icon ? <span className="material-icons-outlined text-sm">{icon}</span> : null}
      </div>
      <span
        className={`text-[10px] font-bold uppercase ${
          muted ? 'text-slate-400' : active ? 'text-primary' : 'text-slate-600'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function WorkLogEntry({
  icon,
  time,
  description,
}: {
  icon: string
  time: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        <span className="material-icons-outlined text-sm">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-slate-500">{time}</p>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  )
}
