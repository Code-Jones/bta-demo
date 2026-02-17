type InitialsAvatarProps = {
  name: string
  size?: 'sm' | 'md'
  className?: string
  toneClassName?: string
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
}

export function InitialsAvatar({
  name,
  size = 'sm',
  className,
  toneClassName,
}: InitialsAvatarProps) {
  const initials = getInitials(name) || 'NA'
  return (
    <div
      className={`rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold uppercase ${
        sizeStyles[size]
      } ${toneClassName ?? ''} ${className ?? ''}`}
    >
      {initials}
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join('')
}
