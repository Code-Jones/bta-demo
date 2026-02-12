import { AppSidebar } from '../../components/AppSidebar'
import { appSidebarBrand, appSidebarItems } from '../../components/appSidebarConfig'
import { SectionCard } from '../../components/SectionCard'
import { StatCard } from '../../components/StatCard'
import { appUser } from '../../data/appUser'

const statCards = [
  { label: 'Total Leads', value: '142', trend: '+8%', tone: 'positive' },
  { label: 'Estimates Sent', value: '98', trend: '--', tone: 'neutral' },
  { label: 'Accepted', value: '64', trend: '+12%', tone: 'positive' },
  { label: 'Jobs Scheduled', value: '42', trend: '-3%', tone: 'negative' },
  { label: 'Invoices Paid', value: '38', trend: '+5%', tone: 'positive' },
  { label: 'Total Revenue', value: '$184.2k', trend: '+18%', tone: 'positive', highlight: true },
]

const revenueMonths = [
  { label: 'May', value: '$22.4k', points: '0,25 20,28 40,20 60,22 80,15 100,25' },
  { label: 'Jun', value: '$28.1k', points: '0,20 20,15 40,25 60,10 80,5 100,15' },
  { label: 'Jul', value: '$24.9k', points: '0,15 20,18 40,10 60,20 80,22 100,25' },
  { label: 'Aug', value: '$34.2k', points: '0,25 20,10 40,5 60,15 80,10 100,5' },
  { label: 'Sep', value: '$31.5k', points: '0,20 20,25 40,15 60,10 80,18 100,10' },
  { label: 'Oct', value: '$43.1k', points: '0,25 20,15 40,20 60,10 80,5 100,0', highlight: true },
]

export function DashboardPage() {
  return (
    <div className="bg-background-light text-slate-900">
      <div className="flex h-screen overflow-hidden">
        <AppSidebar
          brand={appSidebarBrand}
          items={appSidebarItems}
          user={appUser}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            <h1 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Executive Scoreboard
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                <span>Oct 1, 2023 - Oct 31, 2023</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="btn btn-ghost btn-sm text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-xl">notifications</span>
                </button>
                <button className="btn btn-sm bg-primary text-white hover:bg-primary/90">
                  Export Report
                </button>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((card) => (
                <StatCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  trend={card.trend}
                  trendTone={card.tone as 'positive' | 'negative' | 'neutral'}
                  highlight={card.highlight}
                />
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-7 space-y-6">
                <SectionCard title="Conversion Efficiency" badge="LEAD-TO-JOB">
                  <div className="flex items-start gap-4">
                    <ConversionStep
                      step="1"
                      label="Leads"
                      value="142"
                      sublabel="Total"
                      barClass="bg-slate-400 w-full"
                    />
                    <ConversionDivider change="-31%" />
                    <ConversionStep
                      step="2"
                      label="Estimates"
                      value="98"
                      sublabel="69.0% conv."
                      barClass="bg-slate-600 w-[69%]"
                      bubbleClass="bg-slate-200"
                    />
                    <ConversionDivider change="-35%" />
                    <ConversionStep
                      step="3"
                      label="Jobs Won"
                      value="64"
                      sublabel="45.1% total"
                      barClass="bg-accent w-[45%]"
                      bubbleClass="bg-accent text-white"
                      labelClass="text-accent"
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Revenue Performance Trends">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {revenueMonths.map((month) => (
                      <div
                        key={month.label}
                        className={`rounded-lg border px-4 py-3 ${
                          month.highlight
                            ? 'bg-blue-50/50 border-blue-100 ring-1 ring-blue-500/20'
                            : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              month.highlight ? 'text-accent' : 'text-slate-500'
                            }`}
                          >
                            {month.label}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              month.highlight ? 'text-accent' : 'text-slate-400'
                            }`}
                          >
                            {month.value}
                          </span>
                        </div>
                        <svg className="sparkline-svg" viewBox="0 0 100 30">
                          <polyline
                            fill="none"
                            points={month.points}
                            stroke={month.highlight ? '#2563eb' : '#94a3b8'}
                            strokeWidth={month.highlight ? 2.5 : 2}
                          />
                        </svg>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

              <div className="col-span-12 lg:col-span-5 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-200 bg-slate-50/30">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-lg">
                        priority_high
                      </span>
                      What Needs Attention
                    </h2>
                  </div>
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Overdue Invoices
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold">
                        4 Late
                      </span>
                    </div>
                    <div className="space-y-3">
                      <AttentionItem
                        title="Residential Roof - Miller"
                        meta="Invoice #4521 • 12 days overdue"
                        amount="$4,250.00"
                      />
                      <AttentionItem
                        title="Deck Restoration - Ortiz"
                        meta="Invoice #4588 • 8 days overdue"
                        amount="$1,890.00"
                      />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Follow-ups Required
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded-full font-bold">
                        7 Pending
                      </span>
                    </div>
                    <div className="space-y-4">
                      <FollowUpItem
                        initials="TH"
                        name="Thomas Highland"
                        meta="Basement Finishing • $28.5k"
                        time="3d ago"
                      />
                      <FollowUpItem
                        initials="SC"
                        name="Sarah Chen"
                        meta="Exterior Painting • $5.4k"
                        time="5d ago"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50/50 text-center border-t border-slate-200">
                    <button className="text-[10px] font-bold text-slate-500 hover:text-primary tracking-widest uppercase flex items-center justify-center gap-2 w-full">
                      View All Action Items
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
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

type ConversionStepProps = {
  step: string
  label: string
  value: string
  sublabel: string
  barClass: string
  bubbleClass?: string
  labelClass?: string
}

function ConversionStep({
  step,
  label,
  value,
  sublabel,
  barClass,
  bubbleClass,
  labelClass,
}: ConversionStepProps) {
  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            bubbleClass ?? 'bg-slate-100'
          }`}
        >
          {step}
        </div>
        <span
          className={`text-xs font-bold uppercase ${labelClass ?? 'text-slate-500'}`}
        >
          {label}
        </span>
      </div>
      <div className="bg-slate-100 rounded-full h-2 relative overflow-hidden">
        <div className={`absolute inset-y-0 left-0 ${barClass}`} />
      </div>
      <div className="text-lg font-bold">
        {value}{' '}
        <span className="text-[10px] text-slate-400 font-normal ml-1">{sublabel}</span>
      </div>
    </div>
  )
}

function ConversionDivider({ change }: { change: string }) {
  return (
    <div className="pt-10 flex flex-col items-center">
      <div className="w-px h-8 bg-slate-200" />
      <span className="text-[10px] font-bold text-rose-500 my-1">{change}</span>
      <div className="w-px h-8 bg-slate-200" />
    </div>
  )
}

function AttentionItem({ title, meta, amount }: { title: string; meta: string; amount: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-50 rounded transition-colors">
      <div className="flex flex-col">
        <span className="text-xs font-bold group-hover:text-accent">{title}</span>
        <span className="text-[10px] text-slate-500">{meta}</span>
      </div>
      <span className="text-xs font-bold">{amount}</span>
    </div>
  )
}

function FollowUpItem({
  initials,
  name,
  meta,
  time,
}: {
  initials: string
  name: string
  meta: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-accent/30 transition-all cursor-pointer">
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-[10px]">
        {initials}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <p className="text-xs font-bold">{name}</p>
          <span className="text-[10px] text-slate-400 font-medium">{time}</span>
        </div>
        <p className="text-[10px] text-slate-500 mb-2">{meta}</p>
        <div className="flex gap-3">
          <button className="flex items-center gap-1 text-[10px] font-bold text-accent">
            <span className="material-symbols-outlined text-[14px]">call</span>
            Call
          </button>
          <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <span className="material-symbols-outlined text-[14px]">mail</span>
            Email
          </button>
        </div>
      </div>
    </div>
  )
}
