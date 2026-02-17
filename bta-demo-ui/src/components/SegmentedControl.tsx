import type { ReactNode } from 'react'

type SegmentedOption = {
  value: string
  label: ReactNode
  disabled?: boolean
}

type SegmentedControlProps = {
  value: string
  options: SegmentedOption[]
  onChange: (value: string) => void
  className?: string
  buttonClassName?: string
  activeClassName?: string
  inactiveClassName?: string
  size?: 'sm' | 'md'
}

export function SegmentedControl({
  value,
  options,
  onChange,
  className,
  buttonClassName,
  activeClassName = 'bg-primary text-white',
  inactiveClassName = 'text-slate-500 hover:bg-primary/5',
  size = 'sm',
}: SegmentedControlProps) {
  const sizeClass = size === 'sm' ? 'px-4 py-1.5 text-xs' : 'px-4 py-2 text-sm'
  return (
    <div className={`flex rounded-lg border border-slate-200 overflow-hidden ${className ?? ''}`}>
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            className={`${sizeClass} font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              isActive ? activeClassName : inactiveClassName
            } ${buttonClassName ?? ''}`}
            onClick={() => onChange(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
