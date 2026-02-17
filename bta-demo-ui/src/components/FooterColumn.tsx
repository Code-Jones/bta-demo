export type FooterColumnProps = {
    title: string
    links: string[]
    onLinkClick?: (label: string) => void
}

export function FooterColumn({ title, links, onLinkClick }: FooterColumnProps) {
    return (
        <div>
            <h4 className="text-white font-bold mb-6">{title}</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
                {links.map((link) => (
                    <li key={link}>
                        <a
                            className="hover:text-primary transition-colors"
                            href="#"
                            onClick={(event) => {
                                event.preventDefault()
                                onLinkClick?.(link)
                            }}
                        >
                            {link}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}
