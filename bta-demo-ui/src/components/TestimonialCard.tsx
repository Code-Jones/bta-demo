
export type TestimonialCardProps = {
    quote: string
    name: string
    title: string
    imageUrl?: string
}

export function TestimonialCard({ quote, name, title, imageUrl }: TestimonialCardProps) {
    return (
        <div className="glass p-8 rounded-3xl w-full h-full">
            <div className="flex gap-1 text-primary mb-6">
                <div className="rating">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={`${name}-star-${index}`}
                            className="mask mask-star bg-white"
                            aria-label={`${index + 1} star`}
                            aria-current={index === 4 ? 'true' : undefined}
                        ></div>
                    ))}
                </div>
            </div>
            <p className="text-xl text-white font-light italic mb-8 leading-relaxed">"{quote}"</p>
            <div className="flex items-center gap-4">
                <img src={imageUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                    <p className="font-bold text-white">{name}</p>
                    <p className="text-sm text-slate-500">{title}</p>
                </div>
            </div>
        </div>
    )
}
