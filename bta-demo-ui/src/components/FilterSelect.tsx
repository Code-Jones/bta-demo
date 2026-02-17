type FilterSelectProps = {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function FilterSelect({ label, options, value, onChange, className }: FilterSelectProps) {
  return (
    <div className={`flex flex-col ${className ?? ''}`}>
      <label className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 ml-1">{label}</label>
      <select
        className="bg-slate-50 border-slate-200 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-primary text-sm font-medium min-w-[160px]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}
