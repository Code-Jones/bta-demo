import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type ActionMenuItem = {
    label: string
    icon: string
    onClick: () => void
    disabled?: boolean,
    className?: string
}

export type ActionMenuProps = {
    isOpen: boolean
    items: ActionMenuItem[]
    onOpenChange: (nextOpen: boolean) => void
    className?: string
}

export function ActionMenu({ isOpen, onOpenChange, items, className }: ActionMenuProps) {
    const triggerRef = useRef<HTMLButtonElement | null>(null)
    const menuRef = useRef<HTMLUListElement | null>(null)
    const [menuStyle, setMenuStyle] = useState<{ top: number; left: number } | null>(null)

    useLayoutEffect(() => {
        if (!isOpen) return
        const updateMenuPosition = () => {
            if (!triggerRef.current) return
            const rect = triggerRef.current.getBoundingClientRect()
            setMenuStyle({
                left: rect.right,
                top: rect.top,
            })
        }
        const raf = requestAnimationFrame(() => updateMenuPosition())
        window.addEventListener('scroll', updateMenuPosition, true)
        window.addEventListener('resize', updateMenuPosition)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('scroll', updateMenuPosition, true)
            window.removeEventListener('resize', updateMenuPosition)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) queueMicrotask(() => setMenuStyle(null))
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const handleClick = (event: MouseEvent) => {
            const target = event.target as Node
            const inTrigger = triggerRef.current?.contains(target)
            const inMenu = menuRef.current?.contains(target)
            if (!inTrigger && !inMenu) onOpenChange(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [isOpen, onOpenChange])

    const menuEl = isOpen && menuStyle ? (
        <ul
            ref={menuRef}
            className="menu fixed z-100 rounded-box border border-slate-200 bg-base-100 p-2 shadow-lg min-w-48"
            style={{
                left: menuStyle.left,
                top: menuStyle.top,
                transform: 'translate(-100%, 0)',
            }}
        >
            {items.map((item) => (
                <li key={item.label}>
                    <button
                        type="button"
                        onClick={() => {
                            item.onClick()
                            onOpenChange(false)
                        }}
                        disabled={item.disabled}
                        className={item.className}
                    >
                        <span className="material-icons text-base">{item.icon}</span>
                        {item.label}
                    </button>
                </li>
            ))}
        </ul>
    ) : null

    return (
        <>
            <button
                ref={triggerRef}
                className={`btn btn-ghost btn-sm ${className}`}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => onOpenChange(!isOpen)}
            >
                <span className="material-icons">more_vert</span>
            </button>
            {createPortal(menuEl, document.body)}
        </>
    )
}