export const EstimateStatus = {
  Draft: 0,
  Sent: 1,
  Accepted: 2,
  Rejected: 3,
} as const
export type EstimateStatus = (typeof EstimateStatus)[keyof typeof EstimateStatus]

export const InvoiceStatus = {
  Draft: 0,
  Issued: 1,
  Paid: 2,
  Overdue: 3,
} as const
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus]

export type TaxLine = {
  id: string
  label: string
  rate: number
}

export type TaxLineRequest = {
  label: string
  rate: number
}

export const JobStatus = {
  Scheduled: 0,
  InProgress: 1,
  Completed: 2,
  Cancelled: 3,
} as const
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]

export const LeadStatus = {
  New: 0,
  Lost: 1,
  Converted: 2,
} as const
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus]

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
  startDate: string
  endDate: string
  previous: {
    leads: number
    estimatesSent: number
    estimatesAccepted: number
    jobsScheduled: number
    invoicesPaid: number
    totalRevenuePaid: number
  }
}

export type TrendPoint = {
  date: string
  value: number
}

export type TrendChartResponse = {
  revenuePoints: TrendPoint[]
  expensePoints: TrendPoint[]
}

export type DashboardLeadReportItem = {
  id: string
  name: string
  company?: string | null
  status: LeadStatus
  createdAtUtc: string
}

export type DashboardEstimateReportItem = {
  id: string
  leadName: string
  amount: number
  status: EstimateStatus
  createdAtUtc: string
  sentAtUtc?: string | null
}

export type DashboardJobReportItem = {
  id: string
  leadName: string
  status: JobStatus
  startAtUtc: string
  estimatedEndAtUtc: string
}

export type DashboardReportResponse = {
  scoreboard: ScoreboardResponse
  chartData: TrendChartResponse
  leads: DashboardLeadReportItem[]
  estimates: DashboardEstimateReportItem[]
  jobs: DashboardJobReportItem[]
}

export type CreateLeadRequest = {
  name: string
  company?: string | null
  companyId?: string | null
  phone?: string | null
  email?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  leadSource?: string | null
  projectType?: string | null
  estimatedValue?: number | null
  notes?: string | null
  taxLines?: TaxLineRequest[]
}

export type UpdateLeadRequest = {
  name?: string | null
  company?: string | null
  companyId?: string | null
  phone?: string | null
  email?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  leadSource?: string | null
  projectType?: string | null
  estimatedValue?: number | null
  notes?: string | null
  taxLines?: TaxLineRequest[]
}

export type SetLeadStatusRequest = {
  status: string
}

export type CreateLeadResponse = {
  id: string
}

export type LeadResponse = {
  id: string
  name: string
  company?: string | null
  companyId?: string | null
  phone?: string | null
  email?: string | null
  createdAtUtc: string
  status: LeadStatus
  isDeleted?: boolean
  deletedAtUtc?: string | null
}

export type LeadDetailResponse = {
  id: string
  name: string
  company?: string | null
  companyId?: string | null
  phone?: string | null
  email?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  leadSource?: string | null
  projectType?: string | null
  estimatedValue?: number | null
  notes?: string | null
  status: LeadStatus
  createdAtUtc: string
  updatedAtUtc: string
  lostAtUtc?: string | null
  isDeleted?: boolean
  deletedAtUtc?: string | null
  taxLines: TaxLine[]
}

export type CreateEstimateRequest = {
  leadId: string
  amount: number
  description?: string | null
  lineItems?: EstimateLineItemRequest[]
}

export type AcceptEstimateRequest = {
  startAtUtc: string
  estimatedEndAtUtc: string
  milestones?: JobMilestoneTemplateRequest[]
}

export type EstimateResponse = {
  id: string
  status: EstimateStatus
}

export type EstimateLineItemRequest = {
  description: string
  quantity: number
  unitPrice: number
  isTaxLine: boolean
  taxRate?: number | null
  sortOrder: number
}

export type EstimateLineItemResponse = {
  id: string
  description: string
  quantity: number
  unitPrice: number
  isTaxLine: boolean
  taxRate?: number | null
  lineTotal: number
  sortOrder: number
}

export type EstimateListResponse = {
  id: string
  leadId: string
  leadName: string
  leadCompany?: string | null
  leadEmail?: string | null
  leadPhone?: string | null
  leadAddressLine1?: string | null
  leadAddressLine2?: string | null
  leadCity?: string | null
  leadState?: string | null
  leadPostalCode?: string | null
  companyName?: string | null
  companyTaxId?: string | null
  description?: string | null
  subtotal: number
  taxTotal: number
  amount: number
  status: EstimateStatus
  createdAtUtc: string
  updatedAtUtc: string
  sentAtUtc?: string | null
  acceptedAtUtc?: string | null
  rejectedAtUtc?: string | null
  lineItems: EstimateLineItemResponse[]
}

export type UpdateEstimateRequest = {
  description?: string | null
  lineItems?: EstimateLineItemRequest[]
}

export type CreateJobRequest = {
  leadId: string
  estimateId?: string | null
  description?: string | null
  startAtUtc: string
  estimatedEndAtUtc: string
  milestones?: JobMilestoneTemplateRequest[]
}

export type JobResponse = {
  id: string
  status: JobStatus
}

export type JobListResponse = {
  id: string
  leadId: string
  leadName: string
  leadCompany?: string | null
  leadEmail?: string | null
  leadPhone?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  companyId?: string | null
  companyName?: string | null
  companyTaxId?: string | null
  leadTaxLines: TaxLine[]
  companyTaxLines: TaxLine[]
  estimateId?: string | null
  startAtUtc: string
  estimatedEndAtUtc: string
  status: string
}

export type JobMilestoneTemplateRequest = {
  title: string
  notes?: string | null
  status?: MilestoneStatus | null
  occurredAtUtc?: string | null
  sortOrder?: number | null
}

export const MilestoneStatus = {
  Pending: 0,
  Completed: 1,
} as const
export type MilestoneStatus = (typeof MilestoneStatus)[keyof typeof MilestoneStatus]

export type JobMilestoneResponse = {
  id: string
  title: string
  notes?: string | null
  status: MilestoneStatus
  occurredAtUtc: string
  sortOrder: number
  createdAtUtc: string
  updatedAtUtc: string
}

export type JobExpenseResponse = {
  id: string
  vendor: string
  category?: string | null
  amount: number
  spentAtUtc: string
  notes?: string | null
  receiptUrl?: string | null
  createdAtUtc: string
  updatedAtUtc: string
}

export type JobDetailResponse = {
  id: string
  leadId: string
  leadName: string
  leadCompany?: string | null
  leadEmail?: string | null
  leadPhone?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  companyName?: string | null
  companyTaxId?: string | null
  estimateId?: string | null
  description?: string | null
  startAtUtc: string
  estimatedEndAtUtc: string
  status: string
  createdAtUtc: string
  updatedAtUtc: string
  startedAtUtc?: string | null
  completedAtUtc?: string | null
  milestones: JobMilestoneResponse[]
  expenses: JobExpenseResponse[]
}

export type CreateJobMilestoneRequest = {
  title: string
  notes?: string | null
  status?: MilestoneStatus | null
  occurredAtUtc?: string | null
}

export type UpdateJobMilestoneRequest = {
  title?: string | null
  notes?: string | null
  status?: MilestoneStatus | null
  occurredAtUtc?: string | null
  sortOrder?: number | null
}

export type CreateJobExpenseRequest = {
  vendor: string
  category?: string | null
  amount: number
  spentAtUtc: string
  notes?: string | null
  receipt?: File | null
}

export type UpdateJobExpenseRequest = {
  vendor?: string | null
  category?: string | null
  amount?: number | null
  spentAtUtc?: string | null
  notes?: string | null
  receipt?: File | null
}

export type PipelineItemResponse = {
  id: string
  entityType: string
  title: string
  subtitle: string
  amount?: number | null
  status: string
  statusAtUtc?: string | null
}

export type CompanyResponse = {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  website?: string | null
  notes?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  taxId?: string | null
  isDeleted?: boolean
  createdAtUtc?: string | null
  updatedAtUtc?: string | null
}

export type CreateCompanyRequest = {
  name: string
  phone?: string | null
  email?: string | null
  website?: string | null
  notes?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  taxId?: string | null
  taxLines?: TaxLineRequest[]
}

export type UpdateCompanyRequest = {
  name?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  notes?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  taxId?: string | null
  taxLines?: TaxLineRequest[]
}

export type CompanyDetailResponse = {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  website?: string | null
  notes?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  taxId?: string | null
  isDeleted?: boolean
  createdAtUtc?: string | null
  updatedAtUtc?: string | null
  deletedAtUtc?: string | null
  taxLines: TaxLine[]
}

export type LeadMetricsResponse = {
  newLeadsThisMonth: number
  newLeadsLastMonth: number
  leadsWithSentEstimatesThisMonth: number
  leadsWithSentEstimatesLastMonth: number
  leadsWithJobs: number
  totalLeads: number
  conversionRate: number
  conversionRateLastMonth: number
}

export type PipelineColumnResponse = {
  key: string
  title: string
  count: number
  totalValue: number
  items: PipelineItemResponse[]
}

export type PipelineBoardResponse = {
  columns: PipelineColumnResponse[]
  pipelineTotal: number
}

export type InvoiceLineItem = {
  id: string
  description: string
  quantity: number
  unitPrice: number
  isTaxLine: boolean
  taxRate?: number | null
  lineTotal: number
  sortOrder: number
}

export type InvoiceListResponse = {
  id: string
  jobId: string
  leadId: string
  leadName: string
  leadCompany?: string | null
  leadEmail?: string | null
  leadPhone?: string | null
  leadAddressLine1?: string | null
  leadAddressLine2?: string | null
  leadCity?: string | null
  leadState?: string | null
  leadPostalCode?: string | null
  companyName?: string | null
  companyTaxId?: string | null
  jobDescription?: string | null
  jobStartAtUtc?: string | null
  jobEstimatedEndAtUtc?: string | null
  subtotal: number
  taxTotal: number
  amount: number
  status: InvoiceStatus
  createdAtUtc: string
  updatedAtUtc: string
  issuedAtUtc?: string | null
  dueAtUtc?: string | null
  paidAtUtc?: string | null
  notes?: string | null
  lineItems: InvoiceLineItem[]
}

export type InvoiceMetricsResponse = {
  outstandingTotal: number
  outstandingTotalLastMonth: number
  outstandingOverdueCount: number
  paidThisMonthTotal: number
  paidLastMonthTotal: number
  draftTotal: number
  draftTotalLastMonth: number
  draftCount: number
  draftCountLastMonth: number
  averageDaysToPay: number
  averageDaysToPayLastMonth: number
}

export type InvoiceLineItemRequest = {
  description: string
  quantity: number
  unitPrice: number
  isTaxLine: boolean
  taxRate?: number | null
  sortOrder: number
}

export type CreateInvoiceRequest = {
  jobId: string
  dueAtUtc?: string | null
  notes?: string | null
  lineItems: InvoiceLineItemRequest[]
}

export type UpdateInvoiceRequest = {
  dueAtUtc?: string | null
  notes?: string | null
  lineItems?: InvoiceLineItemRequest[]
}

export type InvoiceResponse = {
  id: string
  status: InvoiceStatus
}

export type IssueInvoiceRequest = {
  dueAtUtc?: string | null
}

export type MeResponse = {
  userId: string
  email?: string
  firstName?: string
  lastName?: string
  company?: string
}

export type LoginResponse = {
  token?: string
  accessToken?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  email: string
  password: string
  firstName: string
  lastName: string
  company: string
}

export type RegisterResponse = {
  userId: string
  email: string
  firstName: string
  lastName: string
  company: string
  token?: string
  accessToken?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
}

export type RefreshRequest = {
  refreshToken: string
}

export type RefreshResponse = {
  token?: string
  accessToken?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
}

export type LogoutResponse = {
  message: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ForgotPasswordResponse = {
  message: string
}
