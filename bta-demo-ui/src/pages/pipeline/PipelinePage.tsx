import { AppSidebar } from '../../components/AppSidebar'
import { appSidebarBrand, appSidebarItems } from '../../components/appSidebarConfig'
import { appUser } from '../../data/appUser'

const columns = [
  {
    title: 'Leads',
    count: '4',
    total: null,
    items: [
      {
        tag: 'New Inbound',
        tagTone: 'bg-orange-100 text-orange-700',
        id: '#8842',
        name: 'Robert Patterson',
        meta: 'HVAC Repair',
        value: '$450',
        initials: 'RP',
      },
    ],
  },
  {
    title: 'Estimates (Draft)',
    count: '2',
    total: '$18,200',
    items: [
      {
        tag: 'Drafting',
        tagTone: 'bg-blue-100 text-blue-700',
        name: 'Oakwood Medical',
        meta: 'Electrical Rewiring',
        value: '$12,500',
        avatarUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAJymdDZh8r07RRSTelrRZCF7BMokAG6eMXIabehPHtn5GaGKjBJGRgfvCmytJNCHSMwgqHrkGG90DQQfk3Tl47akiQdQXux2pdhC8wUAR-vz8CyT5VQAiM-rd43LOpgn0xPIWublB7GgXkTvD_8euNODdsULD-bUggSoYRjby6mcC1dtJM9FJEQVU5_BctJ9h1-TOQnlCe-TjMvB6cRVJ8BucgRrjLbtJERsTmF_HuUu3Aw1IdTN2I5Kj5TNdKhvtF9EvjxPdj5gE',
      },
    ],
  },
  {
    title: 'Estimates (Sent)',
    count: '5',
    total: '$42,800',
    highlight: true,
    items: [
      {
        tag: 'Awaiting Response',
        tagTone: 'bg-purple-100 text-purple-700',
        name: 'Pioneer Dist.',
        meta: 'HVAC Installation',
        value: '$32,000',
        highlightValue: true,
        initials: 'SM',
      },
      {
        tag: 'Follow Up Req.',
        tagTone: 'bg-slate-100 text-slate-600',
        name: 'The Coffee Loft',
        meta: 'Electrical Upgrade',
        value: '$3,400',
        avatarUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCkvcvN1W_1tCkwi7LKJAZqMgqTTbf_RDjQQdR0k0_IK67gUidiSRKIDAJ3QWOogs1eV9aiW-wfjnPzEDyPg-xQYX583ZWSp0M0tXgi48nj9yo2STYconNYhMrVK-76uuXL60Dw7qwpb_Tdle3xHXdgxO7JsiaqTiYXqCFeWxiyTj1ht_8M_g-TuPe4HOTD5KtTaLlieFyYGsNfxZeLVI4x5L5SESVBkptfKq2ezvhTYGQWqTa6oy5Ikd7ODDC1l-iF1LugzV6qXmM',
      },
    ],
  },
  {
    title: 'Accepted',
    count: '3',
    total: '$84,000',
    items: [
      {
        tag: 'Deposit Paid',
        tagTone: 'bg-emerald-100 text-emerald-700',
        name: 'Manning Residence',
        meta: 'Complete Roof Replacement',
        value: '$16,500',
        valueTone: 'text-emerald-600',
        initials: 'AJ',
      },
    ],
  },
  {
    title: 'Jobs Scheduled',
    count: '6',
    total: '$120,450',
    items: [
      {
        tag: 'Starts Monday',
        tagTone: 'bg-amber-100 text-amber-700',
        name: 'Greene Logistics',
        meta: 'Warehouse Electrical',
        value: '$48,000',
        avatarUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBo3tX6ckIJZ_yWKVyVDTIkYbIQMotAFmDis4IdbIroNrtDra35OYKELUOOGkq0h4Y2AIj9qYT9pC8fcoaixOtaGwCZjsNMZ25EmiM9TXp9vPLlFKkliVuSRnbsElJY7WR6RA6jg-lmjkOPUt4V9c4h1Ub4914jUSaWAqq3oK_ibPFpmSfEe732cvruTQXYl6Z9M-w-rQsTIypuTLn8VK99BrJhxyf99gSolu1vfFKB-SK-Hxqqamcpf_aBbZGJRyNasiNk9MWtRcA',
      },
      {
        tag: 'Crew Assigned',
        tagTone: 'bg-blue-100 text-blue-700',
        name: 'Skyline Offices',
        meta: 'Plumbing Main Install',
        value: '$22,500',
        initials: 'DC',
      },
    ],
  },
  {
    title: 'Completed',
    count: '12',
    total: '$320,000',
    items: [
      {
        tag: 'Closed',
        tagTone: 'bg-slate-100 text-slate-700',
        name: 'Riverhead Tech Hub',
        meta: 'HVAC Maintenance',
        value: '$1,200',
        valueTone: 'text-slate-500 line-through',
        avatarUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBuVjffYdR6IOSCPJIlHq1Gixs9cku1898PCol1b7tKBIoasj9G7m32mmDcCZ0zGsob0Lr3tErOqSUa6kC1h7bmeI91C73Yw753g7Zv4se54vqZ4ktjG7EkcwrGd2GqH77bXQhr7CqsGyzWAjq0c4a6CnyM_lju3IqCPYiZYWXCwhzcXP3307vnvOAHmiyj4TT6s9qLFcfP-5fptj_McZzdwW6Vg-flXiSA2gPhRgD6e8yyJIsi0rhaal4L6OUpN4Zsp3ZVa3khi0c',
        muted: true,
      },
    ],
  },
]

export function PipelinePage() {
  return (
    <div className="bg-background-light text-slate-900">
      <div className="flex h-screen overflow-hidden">
        <AppSidebar
          brand={appSidebarBrand}
          items={appSidebarItems}
          user={appUser}
        />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Operations &amp; Job Pipeline</h1>
              <p className="text-sm text-slate-500">Track workflow from lead to completion</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  search
                </span>
                <input
                  className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:ring-2 focus:ring-primary w-64 text-sm"
                  placeholder="Search jobs or customers..."
                />
              </div>
              <div className="h-8 w-px bg-slate-200 mx-2" />
              <button className="btn btn-sm bg-primary text-white hover:bg-primary/90 gap-2 shadow-sm">
                <span className="material-icons text-sm">add</span>
                Quick Action
              </button>
            </div>
          </header>

          <section className="bg-white border-b border-slate-200 px-8 py-3 flex items-center gap-6">
            <div className="flex items-center gap-4">
              <FilterSelect label="Trade Type" options={['All Trade Types', 'HVAC', 'Electrical', 'Plumbing', 'Roofing']} />
              <FilterSelect
                label="Assigned To"
                options={['All Assignees', 'Alex Miller', 'Sarah Jenkins', 'David Chen', 'Marcus Wright']}
              />
            </div>
            <div className="ml-auto flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-slate-400">Pipeline Total</p>
                <p className="text-sm font-bold text-slate-900">$284,350.00</p>
              </div>
              <div className="flex bg-slate-100 rounded-md p-1">
                <button className="p-1.5 bg-white shadow-sm rounded-md text-primary">
                  <span className="material-icons text-lg leading-none">view_kanban</span>
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600">
                  <span className="material-icons text-lg leading-none">calendar_view_month</span>
                </button>
              </div>
            </div>
          </section>

          <div className="flex-1 overflow-x-auto custom-scrollbar bg-slate-50 p-6">
            <div className="board-container flex gap-4 h-full">
              {columns.map((column) => (
                <div key={column.title} className="kanban-column flex flex-col">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-700">{column.title}</h3>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          column.highlight
                            ? 'bg-primary text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {column.count}
                      </span>
                    </div>
                    {column.total ? (
                      <span className="text-xs font-semibold text-slate-400">{column.total}</span>
                    ) : (
                      <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                        <span className="material-icons text-lg text-slate-400">more_horiz</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {column.title === 'Leads' ? (
                      <button className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white transition-all text-sm font-medium flex items-center justify-center gap-2">
                        <span className="material-icons text-sm">add</span>
                        Add New Lead
                      </button>
                    ) : null}
                    {column.items.map((item, index) => (
                      <PipelineCard key={`${item.name}-${index}`} {...item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <footer className="bg-white border-t border-slate-200 px-8 py-3 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-6">
              <FooterBadge dotClass="bg-orange-500" label="3 Urgent Leads" />
              <FooterBadge dotClass="bg-blue-500" label="5 Estimates Awaiting" />
              <FooterBadge dotClass="bg-emerald-500" label="$124k Revenue Pending Completion" />
            </div>
            <div className="flex items-center gap-4 font-medium">
              <span className="text-slate-400">
                Average Job Value: <span className="text-slate-900">$18,450</span>
              </span>
              <span>•</span>
              <span className="text-slate-400">
                Completion Rate (MoM): <span className="text-emerald-600">+12.5%</span>
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 ml-1">{label}</label>
      <select className="bg-slate-50 border-slate-200 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-primary text-sm font-medium min-w-[160px]">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}

type PipelineCardProps = {
  tag: string
  tagTone: string
  name: string
  meta: string
  value: string
  initials?: string
  avatarUrl?: string
  highlightValue?: boolean
  valueTone?: string
  muted?: boolean
}

function PipelineCard({
  tag,
  tagTone,
  name,
  meta,
  value,
  initials,
  avatarUrl,
  highlightValue,
  valueTone,
  muted,
}: PipelineCardProps) {
  return (
    <div
      className={`bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        muted ? 'opacity-75 hover:opacity-100' : ''
      } ${highlightValue ? 'border-l-4 border-l-primary/60' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tight ${tagTone}`}>
          {tag}
        </span>
      </div>
      <h4 className="font-bold text-slate-900 text-base mb-1">{name}</h4>
      <p className="text-sm text-slate-500 mb-4">{meta}</p>
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <span className={`text-sm font-bold ${valueTone ?? highlightValue ? 'text-primary' : 'text-slate-700'}`}>
          {value}
        </span>
        {avatarUrl ? (
          <img alt={name} className="w-6 h-6 rounded-full" src={avatarUrl} />
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
            {initials}
          </div>
        )}
      </div>
    </div>
  )
}

function FooterBadge({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${dotClass}`} />
      <span>{label}</span>
    </div>
  )
}
