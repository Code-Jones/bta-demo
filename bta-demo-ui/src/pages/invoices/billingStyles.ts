export const invoiceStatusStyles: Record<string, { tone: string }> = {
  Draft: { tone: 'bg-slate-100 text-slate-600' },
  Issued: { tone: 'bg-sky-100 text-sky-700' },
  Overdue: { tone: 'bg-rose-100 text-rose-700' },
  Paid: { tone: 'bg-emerald-100 text-emerald-700' },
}

export const estimateStatusStyles: Record<string, { tone: string }> = {
  Draft: { tone: 'bg-slate-100 text-slate-600' },
  Sent: { tone: 'bg-indigo-100 text-indigo-700' },
  Accepted: { tone: 'bg-emerald-100 text-emerald-700' },
  Rejected: { tone: 'bg-rose-100 text-rose-700' },
}
