type StatusPillProps = {
  label: string
  tone?: string
  className?: string
}

export function StatusPill({ label, tone, className }: StatusPillProps) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  const toneClass = tone ?? 'bg-slate-100 text-slate-600'
  return <span className={`${base} ${toneClass} ${className ?? ''}`}>{label}</span>
}
