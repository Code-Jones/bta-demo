type SectionCardProps = {
  title: string
  badge?: string
  children: React.ReactNode
  className?: string
}

export function SectionCard({ title, badge, children, className }: SectionCardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className ?? ''}`}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">{title}</h2>
        {badge ? (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  )
}
