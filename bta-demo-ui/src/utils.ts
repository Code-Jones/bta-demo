import { EstimateStatus, JobStatus, LeadStatus, InvoiceStatus } from "./api"

export function formatCurrency(value: number, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
        ...options,
    }).format(value)
}

export function formatPercent(value: number) {
    return `${(value).toFixed(2)}%`
}

export function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date)
}

export function formatDateString(date: string) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date))
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

export function resolveDateCutoff(filter: string, now: Date = new Date()) {
    if (filter === 'all') return null
    if (filter === '90') return new Date(now.getTime() - 90 * DAY_IN_MS)
    if (filter === 'ytd') return new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
    return new Date(now.getTime() - 30 * DAY_IN_MS)
}

export function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
}

export function getInitials(value: string, fallback = 'CO') {
    const initials = value
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()

    return initials || fallback
}

export function exportReport(html: string) {
    const win = window.open('', '_blank', 'width=1200,height=840')
    if (!win) return
    win.document.open()
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
}

export function formatLeadStatus(status: LeadStatus) {
    switch (status) {
        case LeadStatus.New:
            return 'New'
        case LeadStatus.Lost:
            return 'Lost'
        case LeadStatus.Converted:
            return 'Converted'
        default:
            return 'Unknown'
    }
}

export function formatEstimateStatus(status: EstimateStatus) {
    switch (status) {
        case EstimateStatus.Draft:
            return 'Draft'
        case EstimateStatus.Sent:
            return 'Sent'
        case EstimateStatus.Accepted:
            return 'Accepted'
        case EstimateStatus.Rejected:
            return 'Rejected'
        default:
            return 'Unknown'
    }
}

export function formatJobStatus(status: JobStatus) {
    switch (status) {
        case JobStatus.Scheduled:
            return 'Scheduled'
        case JobStatus.InProgress:
            return 'In Progress'
        case JobStatus.Completed:
            return 'Completed'
        case JobStatus.Cancelled:
            return 'Cancelled'
        default:
            return 'Unknown'
    }
}

export function formatInvoiceStatus(status: InvoiceStatus) {
    switch (status) {
        case InvoiceStatus.Draft:
            return 'Draft'
        case InvoiceStatus.Issued:
            return 'Issued'
        case InvoiceStatus.Paid:
            return 'Paid'
        case InvoiceStatus.Overdue:
            return 'Overdue'
    }
}
