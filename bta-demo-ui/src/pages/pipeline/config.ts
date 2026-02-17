

export const titleStyles: Record<string, { tag: string; tone: string; highlight?: boolean; muted?: boolean }> = {
    leads: { tag: 'New Lead', tone: 'bg-orange-100 text-orange-700' },
    leadsLost: { tag: 'Lost', tone: 'bg-rose-100 text-rose-700', muted: true },
    estimatesDraft: { tag: 'Draft', tone: 'bg-blue-100 text-blue-700' },
    estimatesSent: { tag: 'Sent', tone: 'bg-purple-100 text-purple-700', highlight: true },
    estimatesAccepted: { tag: 'Accepted', tone: 'bg-emerald-100 text-emerald-700' },
    estimatesRejected: { tag: 'Declined', tone: 'bg-slate-100 text-slate-600', muted: true },
    jobsScheduled: { tag: 'Scheduled', tone: 'bg-amber-100 text-amber-700' },
    jobsInProgress: { tag: 'In Progress', tone: 'bg-teal-100 text-teal-700' },
    jobsCompleted: { tag: 'Completed', tone: 'bg-slate-100 text-slate-700', muted: true },
    invoicesDraft: { tag: 'Draft', tone: 'bg-indigo-100 text-indigo-700' },
    invoicesIssued: { tag: 'Issued', tone: 'bg-sky-100 text-sky-700' },
    invoicesOverdue: { tag: 'Overdue', tone: 'bg-rose-100 text-rose-700', highlight: true },
    invoicesPaid: { tag: 'Paid', tone: 'bg-emerald-100 text-emerald-700', muted: true },
}

export const boardColumnDefinitions = [
    { key: 'leads', title: 'Leads', sourceKeys: ['leads'] },
    { key: 'estimates', title: 'Estimates', sourceKeys: ['estimatesDraft', 'estimatesSent'] },
    { key: 'scheduled', title: 'Scheduled', sourceKeys: ['jobsScheduled'] },
    { key: 'inProgress', title: 'In Progress', sourceKeys: ['jobsInProgress'] },
    { key: 'completed', title: 'Completed', sourceKeys: ['jobsCompleted'] },
    { key: 'rejected', title: 'Rejected', sourceKeys: ['leadsLost', 'estimatesRejected'] },
]

export const rejectedTimerWindowMs = 24 * 60 * 60 * 1000