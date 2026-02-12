export enum EstimateStatus {
  Draft = 0,
  Sent = 1,
  Accepted = 2,
  Rejected = 3
}

export enum InvoiceStatus {
  Draft = 0,
  Issued = 1,
  Paid = 2,
  Overdue = 3
}

export enum JobStatus {
  Scheduled = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3
}

export type ScoreboardResponse = {
  leads: number
  estimatesDraft: number
  estimatesSent: number
  estimatesAccepted: number
  estimatesRejected: number
  jobsScheduled: number
  invoicesPaid: number
  invoicesUnpaid: number
  invoicesOverdue: number
  totalRevenuePaid: number
}

export type CreateLeadRequest = {
  name: string
  company?: string | null
  phone?: string | null
  email?: string | null
}

export type CreateLeadResponse = {
  id: string
}

export type CreateEstimateRequest = {
  leadId: string
  amount: number
}

export type EstimateResponse = {
  id: string
  status: EstimateStatus
}

export type CreateJobRequest = {
  leadId: string
  estimateId?: string | null
  description?: string | null
  scheduledForUtc: string
}

export type JobResponse = {
  id: string
  status: JobStatus
}

export type InvoiceResponse = {
  id: string
  status: InvoiceStatus
}
