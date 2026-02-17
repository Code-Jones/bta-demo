import { formatCurrency } from "../../utils"
import type { InvoiceMetricsResponse } from "../../api"
import type { EstimateMetrics } from "./InvoicesPage"

export const makeInvoiceStats = (metrics: InvoiceMetricsResponse) => {
    const outstandingTotal = metrics?.outstandingTotal ?? 0
    const paidThisMonth = metrics?.paidThisMonthTotal ?? 0
    const draftValue = metrics?.draftTotal ?? 0
    const avgDays = metrics?.averageDaysToPay ?? 0

    return [
        {
            label: 'Total Outstanding',
            value: formatCurrency(outstandingTotal),
            current: outstandingTotal,
            previous: metrics?.outstandingTotalLastMonth ?? 0,
            icon: 'account_balance_wallet',
            tone: 'text-primary',
            meta: `${metrics?.outstandingOverdueCount ?? 0} overdue`,
        },
        {
            label: 'Paid This Month',
            value: formatCurrency(paidThisMonth),
            current: paidThisMonth,
            previous: metrics?.paidLastMonthTotal ?? 0,
            icon: 'check_circle',
            tone: 'text-emerald-600',
            meta: `Last month ${formatCurrency(metrics?.paidLastMonthTotal ?? 0)}`,
        },
        {
            label: 'Draft Value',
            value: formatCurrency(draftValue),
            current: draftValue,
            previous: metrics?.draftTotalLastMonth ?? 0,
            icon: 'description',
            tone: 'text-amber-600',
            meta: `${metrics?.draftCount ?? 0} drafts`,
        },
        {
            label: 'Average Days to Pay',
            value: `${avgDays} days`,
            current: avgDays,
            previous: metrics?.averageDaysToPayLastMonth ?? 0,
            icon: 'schedule',
            tone: 'text-slate-600',
            meta: `Last month ${metrics?.averageDaysToPayLastMonth ?? 0} days`,
        }
    ]
}

export const makeEstimateStats = (metrics: EstimateMetrics) => {

    return [
        {
            label: 'Pending',
            value: formatCurrency(metrics.pendingTotal),
            current: metrics.pendingTotal,
            previous: metrics.pendingTotalLastMonth,
            icon: 'pending_actions',
            tone: 'text-primary',
            meta: 'Draft + sent value',
        },
        {
            label: 'Sent This Month',
            value: metrics.sentThisMonth,
            current: metrics.sentThisMonth,
            previous: metrics.sentLastMonth,
            icon: 'outgoing_mail',
            tone: 'text-indigo-600',
            meta: 'Awaiting client response',
        },
        {
            label: 'Accepted This Month',
            value: metrics.acceptedThisMonth,
            current: metrics.acceptedThisMonth,
            previous: metrics.acceptedLastMonth,
            icon: 'check_circle',
            tone: 'text-emerald-600',
            meta: 'Won approvals',
        },
        {
            label: 'Conversion Rate',
            value: `${metrics.conversionRate}%`,
            current: metrics.conversionRate,
            previous: metrics.conversionRateLastMonth,
            icon: 'trending_up',
            tone: 'text-slate-600',
            meta: 'Accepted vs rejected',
        }
    ]
}

export const invoiceStatusOptions = [
    { label: 'All', value: 'All' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Issued', value: 'Issued' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Overdue', value: 'Overdue' },
]

export const estimateStatusOptions = [
    { label: 'All', value: 'All' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Sent', value: 'Sent' },
    { label: 'Accepted', value: 'Accepted' },
    { label: 'Rejected', value: 'Rejected' },
]