export type PricingCardProps = {
    title: string
    description: string
    price: string
    cta: string
    features: string[]
    highlight?: boolean
}

export function PricingCard({ title, description, price, cta, features, highlight }: PricingCardProps) {
    return (
        <div
            className={`glass p-10 rounded-3xl flex flex-col border ${highlight ? 'border-2 border-primary relative' : 'border-white/10'
                }`}
        >
            {highlight ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                    Most Popular
                </div>
            ) : null}
            <h3 className="text-2xl font-serif text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm mb-6">{description}</p>
            <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-white">{price}</span>
                {price !== 'Custom' ? <span className="text-slate-500 text-sm">/mo</span> : null}
            </div>
            <ul className="space-y-4 mb-10 grow">
                {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-slate-300">
                        <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                        <span className="text-sm">{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                className={`w-full py-4 rounded-xl text-white font-semibold transition-colors ${highlight
                    ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                    : 'border border-white/10 hover:bg-white/5'
                    }`}
            >
                {cta}
            </button>
        </div>
    )
}