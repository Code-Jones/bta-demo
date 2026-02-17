import TrendArrow from "./TrendArrow"

type StatCardProps = {
  label: string
  value: string | number
  current: number
  previous: number
  trend?: 'up' | 'down' | 'flat'
  highlight?: boolean
  icon?: string
  tone?: string
  meta?: string
}

export function StatCard({ label, value, current, previous, trend, highlight, icon, tone, meta }: StatCardProps) {
  return (
    <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm ${highlight ? 'border-l-4 border-l-accent' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-sm font-medium">{label}</span>
        {icon ? (
          <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center ${tone}`}>
            <span className="material-icons text-lg">{icon}</span>
          </div>
        ) : null}
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        <span className="text-slate-500 text-xs font-semibold flex items-center gap-1">
          <TrendArrow current={current} previous={previous} trend={trend} />
        </span>
      </div>
      {meta ? <p className="text-xs text-slate-400 mt-2">{meta}</p> : null}
    </div>
  )
}
