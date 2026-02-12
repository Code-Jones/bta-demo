type TrendTone = 'positive' | 'negative' | 'neutral'

type StatCardProps = {
  label: string
  value: string
  trend?: string
  trendTone?: TrendTone
  highlight?: boolean
}

const trendStyles: Record<TrendTone, string> = {
  positive: 'text-emerald-600 bg-emerald-50',
  negative: 'text-rose-600 bg-rose-50',
  neutral: 'text-slate-400 bg-slate-100',
}

export function StatCard({ label, value, trend, trendTone = 'neutral', highlight }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${
        highlight ? 'border-l-4 border-l-accent' : ''
      }`}
    >
      <p className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-accent' : 'text-slate-400'}`}>
        {label}
      </p>
      <div className="mt-1 flex items-baseline justify-between">
        <h3 className="text-xl font-bold tracking-tight">{value}</h3>
        {trend ? (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trendStyles[trendTone]}`}>
            {trend}
          </span>
        ) : null}
      </div>
    </div>
  )
}
