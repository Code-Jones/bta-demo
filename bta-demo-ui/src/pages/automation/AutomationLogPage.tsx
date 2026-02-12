import { AppSidebar } from '../../components/AppSidebar'
import { appSidebarBrand, appSidebarItems } from '../../components/appSidebarConfig'
import { appUser } from '../../data/appUser'

const logRows = [
  {
    icon: 'description',
    iconTone: 'bg-blue-100 text-blue-600',
    title: 'Estimate Accepted',
    subtitle: 'ID: EST-1042-XP',
    action: "Created new Job 'Roof Repair - Smith' and assigned Project Lead.",
    time: 'Oct 24, 2023 14:32:01.042',
    status: 'Success',
    statusTone: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: 'payments',
    iconTone: 'bg-slate-100 text-slate-600',
    title: 'Payment Processed',
    subtitle: 'Amt: $4,250.00',
    action: 'QuickBooks Invoice Sync',
    error: 'Error: Authentication token expired',
    time: 'Oct 24, 2023 14:28:44.912',
    status: 'Failed',
    statusTone: 'bg-rose-100 text-rose-600',
  },
  {
    icon: 'mail',
    iconTone: 'bg-purple-100 text-purple-600',
    title: 'New Lead Inquiry',
    subtitle: 'Source: Website Form',
    action: "Sent confirmation email & added to Mailchimp 'New Leads' list.",
    time: 'Oct 24, 2023 14:15:22.115',
    status: 'Success',
    statusTone: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: 'notification_important',
    iconTone: 'bg-amber-100 text-amber-600',
    title: 'Job Delayed',
    subtitle: 'Ref: JOB-8812',
    action: 'Triggered SMS notification to Customer & updated Project Board.',
    time: 'Oct 24, 2023 14:10:05.542',
    status: 'Success',
    statusTone: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: 'schedule',
    iconTone: 'bg-primary/10 text-primary',
    title: 'Cron: Nightly Cleanup',
    subtitle: 'System Maintenance',
    action: 'Archived 12 completed jobs & updated capacity indices.',
    time: 'Oct 24, 2023 03:00:00.000',
    status: 'Success',
    statusTone: 'bg-emerald-100 text-emerald-600',
  },
]

export function AutomationLogPage() {
  return (
    <div className="bg-background-dark text-slate-100">
      <div className="flex h-screen overflow-hidden">
        <AppSidebar
          brand={appSidebarBrand}
          items={appSidebarItems}
          user={appUser}
        />
        <main className="flex-1 flex flex-col min-w-0 bg-background-dark">
          <header className="h-16 flex items-center justify-between px-8 bg-slate-900/50 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md">
                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  className="w-full bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                  placeholder="Search by event ID or type..."
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-tighter">
                  System Live
                </span>
              </div>
              <button className="relative text-slate-500 hover:text-primary transition-colors">
                <span className="material-icons-round">notifications</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
              </button>
              <button className="btn btn-sm bg-primary text-white hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20">
                <span className="material-icons-round text-sm">download</span>
                Export Logs
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">Automation &amp; System Activity</h2>
              <p className="text-slate-400 text-sm mt-1">
                Monitoring 1,248 active automation flows across the organization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <MetricCard label="Events (24h)" value="14,802" trend="12% from yesterday" trendTone="text-emerald-500" icon="trending_up" />
              <MetricCard label="Success Rate" value="99.2%" trend="Stable performance" trendTone="text-slate-400" icon="check_circle" />
              <MetricCard label="Active Triggers" value="42" trend="Real-time processing" trendTone="text-primary" icon="bolt" />
              <MetricCard label="Failed Tasks" value="14" trend="Requires attention" trendTone="text-rose-500" icon="error_outline" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                <button className="whitespace-nowrap bg-primary text-white px-4 py-1.5 rounded-full text-xs font-semibold">
                  All Logs
                </button>
                <button className="whitespace-nowrap bg-slate-800 text-slate-400 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-slate-700 transition-colors">
                  Succeeded
                </button>
                <button className="whitespace-nowrap bg-slate-800 text-slate-400 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-slate-700 transition-colors">
                  Failed
                </button>
                <div className="h-4 w-px bg-slate-700 mx-2"></div>
                <button className="flex items-center gap-1 bg-slate-800 text-slate-400 px-4 py-1.5 rounded-full text-xs font-semibold">
                  <span className="material-icons-round text-sm">calendar_today</span>
                  Today
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 text-slate-400 text-xs font-medium hover:text-primary transition-colors">
                  <span className="material-icons-round text-[16px]">filter_list</span>
                  Advanced Filters
                </button>
                <div className="h-4 w-px bg-slate-700"></div>
                <p className="text-xs text-slate-500">
                  Auto-refreshing in <span className="text-primary font-mono">14s</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-slate-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Trigger Event
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Automated Action
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {logRows.map((row) => (
                      <tr key={row.title} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${row.iconTone}`}>
                              <span className="material-icons-round text-sm">{row.icon}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{row.title}</p>
                              <p className="text-xs text-slate-400">{row.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-icons-round text-[16px] text-slate-400">subdirectory_arrow_right</span>
                            <div>
                              <p className="text-sm">{row.action}</p>
                              {row.error ? (
                                <p className="text-xs text-rose-500 font-medium mt-0.5">{row.error}</p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-mono text-slate-400">{row.time}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${row.statusTone}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {row.status === 'Failed' ? (
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-xs font-bold uppercase">
                                Retry
                              </button>
                              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400">
                                <span className="material-icons-round text-sm">more_vert</span>
                              </button>
                            </div>
                          ) : (
                            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-primary">
                              <span className="material-icons-round text-sm">launch</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-slate-800/30 flex items-center justify-between border-t border-slate-800">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-bold text-slate-300">1 - 5</span> of 2,401 logs
                </p>
                <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800">
                    <span className="material-icons-round text-sm">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-white text-xs font-bold">
                    1
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-700 text-slate-400 text-xs hover:bg-slate-800">
                    2
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-700 text-slate-400 text-xs hover:bg-slate-800">
                    3
                  </button>
                  <span className="px-1 text-slate-500">...</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-700 text-slate-400 text-xs hover:bg-slate-800">
                    480
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800">
                    <span className="material-icons-round text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="material-icons-round text-primary">data_object</span>
                  Recent Payload Inspection
                </h3>
                <div className="bg-slate-950 rounded-lg p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto custom-scrollbar">
                  <pre>{`{
  "event_type": "ESTIMATE_ACCEPTED",
  "actor": "CLIENT_PORTAL",
  "payload": {
    "estimate_id": "EST-1042-XP",
    "customer": "Robert Smith",
    "value": 12500.00,
    "timestamp": "2023-10-24T14:32:01.042Z"
  },
  "automation_path": "AUTO_FLOW_09_JOB_GEN",
  "result": "SUCCESS"
}`}</pre>
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="material-icons-round text-rose-500">warning</span>
                  Unresolved Issues
                </h3>
                <div className="space-y-4">
                  <IssueCard
                    icon="error"
                    iconTone="text-rose-500"
                    title="QuickBooks Auth Error"
                    description="Token expired for user 'finance@buildflow.pro'. All invoice syncs are currently paused."
                    actionLabel="Re-authenticate Now"
                    actionTone="text-rose-400"
                    bgTone="bg-rose-900/10"
                    borderTone="border-rose-900/30"
                  />
                  <IssueCard
                    icon="report_problem"
                    iconTone="text-amber-500"
                    title="Webhook Latency Warning"
                    description="Mailchimp API is responding slower than usual (Avg: 2.4s). This may delay welcome emails."
                    bgTone="bg-slate-800/50"
                    borderTone="border-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  trend,
  trendTone,
  icon,
}: {
  label: string
  value: string
  trend: string
  trendTone: string
  icon: string
}) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
      <p className="text-slate-400 text-xs font-medium uppercase mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendTone}`}>
        <span className="material-icons-round text-sm">{icon}</span>
        <span>{trend}</span>
      </div>
    </div>
  )
}

function IssueCard({
  icon,
  iconTone,
  title,
  description,
  actionLabel,
  actionTone,
  bgTone,
  borderTone,
}: {
  icon: string
  iconTone: string
  title: string
  description: string
  actionLabel?: string
  actionTone?: string
  bgTone: string
  borderTone: string
}) {
  return (
    <div className={`flex items-start gap-4 p-3 rounded-lg border ${bgTone} ${borderTone}`}>
      <span className={`material-icons-round mt-0.5 ${iconTone}`}>{icon}</span>
      <div>
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
        {actionLabel ? (
          <button className={`mt-2 text-[10px] font-bold uppercase tracking-wider hover:underline ${actionTone}`}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
