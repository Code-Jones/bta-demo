import { AppSidebar } from '../../components/AppSidebar'
import { appSidebarBrand, appSidebarItems } from '../../components/appSidebarConfig'
import { appUser } from '../../data/appUser'

export function CustomerDetailPage() {
  return (
    <div className="bg-background-light text-slate-900">
      <div className="flex h-screen overflow-hidden">
        <AppSidebar
          brand={appSidebarBrand}
          items={appSidebarItems}
          user={appUser}
        />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-primary transition-colors">
                <span className="material-icons">arrow_back</span>
              </button>
              <nav className="flex text-sm text-slate-500">
                <span>Customers</span>
                <span className="mx-2">/</span>
                <span className="text-slate-900 font-medium">Robert J. Harrison</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="material-icons text-sm">edit</span>
                Edit Profile
              </button>
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20">
                <span className="material-icons text-sm">add</span>
                Create Estimate
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
                <span className="material-icons text-sm">event</span>
                Schedule Job
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto flex">
            <aside className="w-[350px] border-r border-slate-200 p-8 space-y-8 bg-white/50 backdrop-blur-sm">
              <div className="text-center lg:text-left">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 mx-auto lg:mx-0">
                  <span className="text-2xl font-bold">RH</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Robert J. Harrison</h1>
                <div className="flex items-center gap-2 mt-1 justify-center lg:justify-start">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Active Customer
                  </span>
                  <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">since 2022</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Information</h3>
                <div className="space-y-3">
                  <InfoRow icon="phone" value="(555) 123-4567" />
                  <InfoRow icon="email" value="robert.h@example.com" />
                  <div className="flex items-start gap-3">
                    <span className="material-icons text-slate-400 text-base">location_on</span>
                    <div className="text-sm font-medium">
                      <p>452 Oakwood Drive</p>
                      <p>Suite 200, Portland, OR 97201</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden mt-4 border border-slate-200">
                  <img
                    className="w-full h-32 object-cover grayscale opacity-80 hover:grayscale-0 transition-all cursor-pointer"
                    alt="Map preview"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp5TgvbLPD9VN5Ad04J6ppNp1vCMS8qAKkxP9kR3KJGi5LuZ7wcsLrE8I7OXoCwPIBHRvLyhQ_4S4FfootaYe2APIsSt1UohsgxFi0nP3qsjVvzdOgt-aC52YLIEHq7HHQvqToZdVOl-pGR7TQaYgHYaH7UT2xSBRgyASI7A7Pz6JTQvmmyXFh8AIb_KGe7oMFesBBms0NzbP1lF0awlc_CoWB7pNCS0b4dyMZ6_jx9zaCqDs_1K9dtfhRND3yuoaW15Kxoszu_Ok"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Company Details</h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Company Name</p>
                  <p className="text-sm font-bold mt-1">Harrison Logistics & Supply</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium">Internal ID</p>
                    <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded">#CUST-8821</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-lg font-bold text-slate-900">$14,250.00</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding</p>
                  <p className="text-lg font-bold text-red-500">$1,200.00</p>
                </div>
              </div>
            </aside>

            <div className="flex-1 p-8 space-y-8 bg-background-light">
              <div className="flex items-center gap-8 border-b border-slate-200">
                <button className="pb-4 text-sm font-bold border-b-2 border-primary text-primary">
                  Overview & Records
                </button>
                <button className="pb-4 text-sm font-medium text-slate-400 hover:text-slate-600">
                  Detailed Timeline
                </button>
                <button className="pb-4 text-sm font-medium text-slate-400 hover:text-slate-600">
                  Documents & Photos
                </button>
                <button className="pb-4 text-sm font-medium text-slate-400 hover:text-slate-600">
                  Notes (3)
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-icons text-primary text-xl">history</span>
                    Activity Timeline
                  </h2>
                  <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    <TimelineItem
                      icon="done"
                      colorClass="bg-emerald-500"
                      title="Estimate Accepted"
                      description="Estimate #EST-1092 was accepted by Robert."
                      timestamp="Oct 24, 2023 · 2:30 PM"
                    />
                    <TimelineItem
                      icon="send"
                      colorClass="bg-primary"
                      title="Estimate Sent"
                      description="Email sent to robert.h@example.com"
                      timestamp="Oct 23, 2023 · 9:15 AM"
                    />
                    <TimelineItem
                      icon="edit_note"
                      colorClass="bg-slate-400"
                      title="Note Added"
                      description='"Customer requested specific eco-friendly materials for the HVAC replacement."'
                      timestamp="Oct 22, 2023 · 4:00 PM"
                    />
                    <TimelineItem
                      icon="person_add"
                      colorClass="bg-blue-100 text-primary"
                      title="Lead Created"
                      description="Robert was added as a lead from Website Inquiry."
                      timestamp="Oct 20, 2023 · 11:20 AM"
                      ringClass="ring-background-light"
                    />
                  </div>
                  <button className="w-full py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg border border-dashed border-primary/30 transition-colors">
                    View All Activity
                  </button>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <DataTableCard
                    title="Active Jobs"
                    icon="engineering"
                    actionLabel="View All"
                    columns={['Job Details', 'Scheduled', 'Technician', 'Status']}
                    rows={[
                      ['HVAC Maintenance', 'Nov 12, 2023', 'D. Morgan', 'SCHEDULED'],
                    ]}
                  />
                  <DataTableCard
                    title="Estimates"
                    icon="description"
                    actionLabel="View All"
                    columns={['ID & Name', 'Created', 'Total', 'Status']}
                    rows={[
                      ['Full System Install', 'Oct 23, 2023', '$12,450.00', 'ACCEPTED'],
                      ['Duct Cleaning', 'Sep 15, 2023', '$1,800.00', 'EXPIRED'],
                    ]}
                  />
                  <DataTableCard
                    title="Invoices"
                    icon="account_balance_wallet"
                    actionLabel="View All"
                    columns={['Invoice #', 'Due Date', 'Balance', 'Status']}
                    rows={[['INV-88721', 'Oct 30, 2023', '$1,200.00', 'OVERDUE']]}
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

function InfoRow({ icon, value }: { icon: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="material-icons text-slate-400 text-base">{icon}</span>
      <span className="text-sm font-medium">{value}</span>
      <button className="ml-auto text-primary hover:bg-primary/10 p-1 rounded transition-colors">
        <span className="material-icons text-sm">content_copy</span>
      </button>
    </div>
  )
}

function TimelineItem({
  icon,
  colorClass,
  title,
  description,
  timestamp,
  ringClass,
}: {
  icon: string
  colorClass: string
  title: string
  description: string
  timestamp: string
  ringClass?: string
}) {
  return (
    <div className="relative">
      <span
        className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ${
          ringClass ?? 'ring-background-light'
        } ${colorClass}`}
      >
        <span className="material-icons text-xs">{icon}</span>
      </span>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
        <span className="text-[10px] text-slate-400 uppercase font-medium mt-2 block">
          {timestamp}
        </span>
      </div>
    </div>
  )
}

function DataTableCard({
  title,
  icon,
  actionLabel,
  columns,
  rows,
}: {
  title: string
  icon: string
  actionLabel: string
  columns: string[]
  rows: string[][]
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-icons text-primary">{icon}</span>
          {title}
        </h3>
        <button className="text-xs font-bold text-primary hover:underline">{actionLabel}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-6 py-3 font-bold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.join('-')} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                {row.map((cell) => (
                  <td key={cell} className="px-6 py-4 text-sm">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
