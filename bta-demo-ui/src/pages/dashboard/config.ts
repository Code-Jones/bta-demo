import type { ScoreboardResponse } from "../../api"
import { formatCurrency, formatPercent } from "../../utils"


export const makeStatCards = (scoreboard: ScoreboardResponse) => [
    {
        label: 'Total Leads',
        value: scoreboard.leads,
        current: scoreboard.leads,
        previous: scoreboard.previous.leads,
    },
    {
        label: 'Estimates Sent',
        value: scoreboard.estimatesSent,
        current: scoreboard.estimatesSent,
        previous: scoreboard.previous.estimatesSent,
    },
    {
        label: 'Accepted',
        value: scoreboard.estimatesAccepted,
        current: scoreboard.estimatesAccepted,
        previous: scoreboard.previous.estimatesAccepted,
    },
    {
        label: 'Jobs Scheduled',
        value: scoreboard.jobsScheduled,
        current: scoreboard.jobsScheduled,
        previous: scoreboard.previous.jobsScheduled,
    },
    {
        label: 'Invoices Paid',
        value: scoreboard.invoicesPaid,
        current: scoreboard.invoicesPaid,
        previous: scoreboard.previous.invoicesPaid,
    },
    {
        label: 'Total Revenue',
        value: formatCurrency(scoreboard.totalRevenuePaid),
        current: scoreboard.totalRevenuePaid,
        previous: scoreboard.previous.totalRevenuePaid,
        highlight: true,
    },
];

export const makeConversionSteps = (scoreboard: ScoreboardResponse, estimateConversion: number, jobConversion: number) => [
    {
        step: '1',
        label: 'Leads',
        value: scoreboard.leads.toString(),
        sublabel: 'Total',
        barClass: 'bg-slate-400',
        barStyle: { width: '100%' },
    },
    {
        step: '2',
        label: 'Estimates',
        value: scoreboard.estimatesSent.toString(),
        sublabel: `${formatPercent(estimateConversion)} conv.`,
        barClass: 'bg-slate-600',
        barStyle: { width: `${Math.min(100, estimateConversion)}%` },
        bubbleClass: 'bg-slate-200',
    },
    {
        step: '3',
        label: 'Jobs Scheduled',
        value: scoreboard.jobsScheduled.toString(),
        sublabel: `${formatPercent(jobConversion)} total`,
        barClass: 'bg-accent',
        barStyle: { width: `${Math.min(100, jobConversion)}%` },
        bubbleClass: 'bg-accent text-white',
        labelClass: 'text-accent',
    },
];