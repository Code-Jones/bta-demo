import type { CSSProperties } from "react"
import React from "react"

export type ConversionStepProps = {
    step: string
    label: string
    value: string
    sublabel: React.ReactNode
    barClass: string
    barStyle?: CSSProperties
    bubbleClass?: string
    labelClass?: string
}

function ConversionDivider() {
    return (
        <div className="pt-10 flex flex-col items-center shrink-0">
            <div className="w-px h-8 bg-slate-200" />
            <div className="w-px h-8 bg-slate-200" />
        </div>
    )
}

export function ConversionSteps({ steps }: { steps: ConversionStepProps[] }) {
    return (
        <div className="flex items-start gap-4">
            {steps.flatMap((step, index) =>
                index < steps.length - 1
                    ? [
                          <ConversionStep key={step.step} {...step} />,
                          <ConversionDivider key={`divider-${step.step}`} />,
                      ]
                    : [<ConversionStep key={step.step} {...step} />]
            )}
        </div>
    )
}


function ConversionStep({
    step,
    label,
    value,
    sublabel,
    barClass,
    barStyle,
    bubbleClass,
    labelClass,
}: ConversionStepProps) {
    return (
        <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${bubbleClass ?? 'bg-slate-100'
                        }`}
                >
                    {step}
                </div>
                <span
                    className={`text-xs font-bold uppercase ${labelClass ?? 'text-slate-500'}`}
                >
                    {label}
                </span>
            </div>
            <div className="bg-slate-100 rounded-full h-2 relative overflow-hidden">
                <div className={`absolute inset-y-0 left-0 ${barClass}`} style={barStyle} />
            </div>
            <div className="text-lg font-bold">
                {value}{' '}
                <span className="text-[10px] text-slate-400 font-normal ml-1">{sublabel}</span>
            </div>
        </div>
    )
}
