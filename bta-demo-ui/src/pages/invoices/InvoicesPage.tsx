import { AppSidebar } from '../../components/AppSidebar'
import { appSidebarBrand, appSidebarItems } from '../../components/appSidebarConfig'
import { appUser } from '../../data/appUser'

const invoiceRows = [
  {
    initials: 'JD',
    name: 'John Doe',
    job: 'Kitchen Remodel',
    detail: 'Full cabinet install & tiling',
    date: 'Oct 12, 2023',
    amount: '$4,250.00',
    status: 'Overdue',
    statusTone: 'bg-red-100 text-red-700',
  },
  {
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZLoF7Nq_kKYTqXqpOPTpdtsAWBjQcQ7CNpCkrSjzghYqT26tBbIe4sJXKfAonf8mOraROMtLEiwFZujeI5w6Sn_VcreK3dA0Vy4h0NaKOyz2aGQWlb4v5GiKDlwiM4iAfR8xX24sDqkNGzUS2zqkqeMABwdG_BcXIgOo8ttG7p6EECLeLUTauWKK655V45PR6L8SySYIHioQW_CgR0-dJKHojZ5_lTS2aiOYVvAu-GLSVNYanlcAY5UjlIe6UEQRxhbbm-4zWi-k',
    name: 'Sarah Wilson',
    job: 'Electrical Repair',
    detail: 'Fuse box replacement',
    date: 'Oct 24, 2023',
    amount: '$840.00',
    status: 'Paid',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    initials: 'MK',
    name: 'Marcus King',
    job: 'Outdoor Lighting',
    detail: 'Patio & poolside setup',
    date: 'Oct 28, 2023',
    amount: '$1,500.00',
    status: 'Issued',
    statusTone: 'bg-blue-100 text-blue-700',
  },
  {
    initials: 'ET',
    name: 'Emily Taylor',
    job: 'Emergency Service',
    detail: 'Power outage diagnostic',
    date: '-',
    amount: '$250.00',
    status: 'Draft',
    statusTone: 'bg-slate-100 text-slate-600',
  },
]

export function InvoicesPage() {
  return (
    <div className="bg-background-light text-slate-900">
      <div className="flex min-h-screen">
        <AppSidebar
          brand={appSidebarBrand}
          items={appSidebarItems}
          user={appUser}
        />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
            <h1 className="text-xl font-bold">Invoices</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full">
                <span className="material-icons">notifications</span>
              </button>
              <button className="btn btn-sm bg-primary text-white hover:bg-primary/90 gap-2">
                <span className="material-icons text-sm">add</span>
                Create Invoice
              </button>
            </div>
          </header>

          <div className="p-8 space-y-8 flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatBox label="Total Outstanding" value="$12,450.00" meta="12 overdue" metaTone="text-red-500" />
              <StatBox label="Paid this month" value="$8,290.40" meta="+15% vs last" metaTone="text-emerald-500" />
              <StatBox label="Draft Value" value="$3,100.00" meta="5 invoices" metaTone="text-slate-400" />
              <StatBox label="Average Days to Pay" value="14 days" meta="-2 days" metaTone="text-emerald-500" />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
                  <div className="relative w-full md:w-64">
                    <span className="material-icons absolute left-3 top-2.5 text-slate-400 text-sm">
                      search
                    </span>
                    <input
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Search customer or job..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                      Status: All
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                      Date: Last 30 Days
                    </button>
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <span className="material-icons text-xl">filter_list</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Job Details</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date Issued</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoiceRows.map((row) => (
                        <tr key={row.name} className="hover:bg-primary/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {row.avatarUrl ? (
                                <img className="w-8 h-8 rounded-full object-cover" alt={row.name} src={row.avatarUrl} />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs uppercase">
                                  {row.initials}
                                </div>
                              )}
                              <span className="font-medium text-sm">{row.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">{row.job}</p>
                            <p className="text-xs text-slate-500">{row.detail}</p>
                          </td>
                          <td className="px-6 py-4 text-sm tabular-nums text-slate-600">{row.date}</td>
                          <td className="px-6 py-4 font-semibold text-sm tabular-nums">{row.amount}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.statusTone}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Showing 1-10 of 48 invoices</span>
                  <div className="flex gap-2">
                    <button className="p-1.5 border border-slate-200 rounded hover:bg-slate-50">
                      <span className="material-icons text-lg">chevron_left</span>
                    </button>
                    <button className="p-1.5 border border-slate-200 rounded hover:bg-slate-50">
                      <span className="material-icons text-lg">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>

              <aside className="w-full lg:w-96 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-fit">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-bold">#INV-2023-042</h2>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Issued on Oct 12, 2023</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Overdue
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90">
                      <span className="material-icons text-sm">check_circle</span>
                      Mark Paid
                    </button>
                    <button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <span className="material-icons text-slate-500 text-lg">print</span>
                    </button>
                    <button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <span className="material-icons text-slate-500 text-lg">mail</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <section>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                      Customer Information
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm uppercase">
                        JD
                      </div>
                      <div>
                        <p className="font-semibold text-sm">John Doe</p>
                        <p className="text-xs text-slate-500">john.doe@email.com</p>
                        <p className="text-xs text-slate-500">123 Pine St, Seattle, WA</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                      Invoice Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-medium tabular-nums">$3,950.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tax (8%)</span>
                        <span className="font-medium tabular-nums">$300.00</span>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex justify-between">
                        <span className="font-bold">Total Due</span>
                        <span className="font-bold tabular-nums text-primary">$4,250.00</span>
                      </div>
                    </div>
                  </section>

                  <section className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-2">
                      <span className="material-icons text-sm">payment</span>
                      Payment Status
                    </h3>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-400">Payment Date</label>
                      <input
                        className="w-full bg-white border border-slate-200 rounded-lg text-sm px-3 py-2"
                        type="date"
                        defaultValue="2023-11-05"
                      />
                      <p className="text-[10px] text-red-500 mt-1 italic leading-tight">
                        Payment is 14 days overdue. Consider sending a friendly reminder.
                      </p>
                    </div>
                  </section>
                </div>

                <div className="p-6 border-t border-slate-200 mt-auto">
                  <button className="w-full text-sm font-medium text-red-500 py-2 border border-red-200 rounded-lg hover:bg-red-50">
                    Delete Invoice
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function StatBox({
  label,
  value,
  meta,
  metaTone,
}: {
  label: string
  value: string
  meta: string
  metaTone: string
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className={`text-xs font-medium ${metaTone}`}>{meta}</span>
      </div>
    </div>
  )
}
