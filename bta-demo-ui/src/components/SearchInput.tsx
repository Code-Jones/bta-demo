type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  showIcon?: boolean
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  showIcon = true,
}: SearchInputProps) {
  const inputPadding = showIcon ? 'pl-10' : 'pl-4'
  return (
    <div className={`relative ${className ?? ''}`}>
      {showIcon ? (
        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
          search
        </span>
      ) : null}
      <input
        className={`w-full ${inputPadding} pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-primary focus:border-primary ${
          inputClassName ?? ''
        }`}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
