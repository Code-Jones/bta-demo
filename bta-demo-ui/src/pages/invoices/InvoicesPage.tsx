import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { InvoiceIssueModal } from '../../components/modals/InvoiceIssueModal'
import { InvoiceUpsertModal } from '../../components/modals/InvoiceUpsertModal'
import { EstimateUpsertModal } from '../../components/modals/EstimateUpsertModal'
import { EstimateAcceptModal } from '../../components/modals/EstimateAcceptModal'
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal'
import {
  invoiceMetricsQueryOptions,
  invoicesQueryOptions,
} from '../../api/invoices'
import {
  estimatesQueryOptions,
} from '../../api/estimates'
import { jobsQueryOptions } from '../../api/jobs'
import { leadsQueryOptions } from '../../api/leads'
import { EstimateStatus, type EstimateListResponse, type InvoiceListResponse } from '../../api'
import { AppLayout } from '../AppLayout'
import {
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useIssueInvoiceMutation,
  useMarkPaidMutation,
  useCreateEstimateMutation,
  useUpdateEstimateMutation,
  useSendEstimateMutation,
  useRejectEstimateMutation,
  useAcceptEstimateMutation,
  type EstimateAcceptModalState,
} from './mutations'
import { StatCard } from '../../components/StatCard'
import { SectionCard } from '../../components/SectionCard'
import { Table } from '../../components/table/Table'
import { ActionMenu } from '../../components/table/ActionMenu'
import { InitialsAvatar } from '../../components/InitialsAvatar'
import { StatusPill } from '../../components/StatusPill'
import { SegmentedControl } from '../../components/SegmentedControl'
import { SearchInput } from '../../components/SearchInput'
import { useAutoSelectedId } from '../../hooks/useAutoSelectedId'
import {
  formatCurrency,
  formatDateString,
  formatEstimateStatus,
  formatInvoiceStatus,
  resolveDateCutoff,
} from '../../utils'
import { invoiceStatusStyles, estimateStatusStyles } from './billingStyles'
import { openInvoicePrintView } from './printInvoice'
import { openEstimatePrintView } from './printEstimate'
import { InvoiceDetails } from './InvoiceDetails'
import { EstimateDetails } from './EstimateDetails'
import { makeInvoiceStats, makeEstimateStats, invoiceStatusOptions, estimateStatusOptions } from './config'

type InvoiceRow = {
  id: string
  name: string
  company: string
  job: string
  detail: string
  date: string
  amount: string
  status: string
  statusTone: string
  anchorDate: string
  invoice: InvoiceListResponse
}

type EstimateRow = {
  id: string
  name: string
  company: string
  project: string
  detail: string
  date: string
  amount: string
  status: string
  statusTone: string
  anchorDate: string
  estimate: EstimateListResponse
}

export type EstimateMetrics = {
  pendingTotal: number
  sentThisMonth: number
  acceptedThisMonth: number
  conversionRate: number
  pendingTotalLastMonth: number
  sentLastMonth: number
  acceptedLastMonth: number
  conversionRateLastMonth: number
}

type BillingView = 'invoices' | 'estimates'



export function InvoicesPage() {
  const [view, setView] = useState<BillingView>('invoices')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('30')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editInvoice, setEditInvoice] = useState<InvoiceListResponse | null>(null)
  const [issueInvoiceModal, setIssueInvoiceModal] = useState<InvoiceListResponse | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<InvoiceListResponse | null>(null)
  const [createEstimateOpen, setCreateEstimateOpen] = useState(false)
  const [editEstimate, setEditEstimate] = useState<EstimateListResponse | null>(null)
  const [estimateAccept, setEstimateAccept] = useState<EstimateAcceptModalState>(null)
  const queryClient = useQueryClient()
  const createInvoiceMutation = useCreateInvoiceMutation(queryClient, setCreateOpen)
  const updateInvoiceMutation = useUpdateInvoiceMutation(queryClient, setEditInvoice)
  const deleteInvoiceMutation = useDeleteInvoiceMutation(queryClient, setConfirmDelete)
  const issueInvoiceMutation = useIssueInvoiceMutation(queryClient, setIssueInvoiceModal)
  const markPaidMutation = useMarkPaidMutation(queryClient)
  const createEstimateMutation = useCreateEstimateMutation(queryClient, setCreateEstimateOpen)
  const updateEstimateMutation = useUpdateEstimateMutation(queryClient, setEditEstimate)
  const sendEstimateMutation = useSendEstimateMutation(queryClient)
  const rejectEstimateMutation = useRejectEstimateMutation(queryClient)
  const acceptEstimateMutation = useAcceptEstimateMutation(queryClient, setEstimateAccept)


  const invoicesQuery = useQuery(invoicesQueryOptions())
  const estimatesQuery = useQuery(estimatesQueryOptions())
  const metricsQuery = useQuery(invoiceMetricsQueryOptions())
  const jobsQuery = useQuery(jobsQueryOptions())
  const leadsQuery = useQuery(leadsQueryOptions())

  const rows = useMemo<InvoiceRow[]>(() => {
    if (!invoicesQuery.data) return []
    return invoicesQuery.data.map((invoice) => {
      const displayStatus = formatInvoiceStatus(invoice.status)
      const statusTone = invoiceStatusStyles[displayStatus]?.tone ?? 'bg-slate-100 text-slate-600'
      const anchorDate = invoice.issuedAtUtc ?? invoice.createdAtUtc
      const name = invoice.leadName || 'Unknown Lead'
      const company = invoice.leadCompany || invoice.companyName || '—'
      const job = invoice.jobDescription || 'Job work'
      const detail = invoice.leadAddressLine1
        ? [invoice.leadAddressLine1, invoice.leadCity, invoice.leadState].filter(Boolean).join(', ')
        : invoice.leadEmail || '—'

      return {
        id: invoice.id,
        name,
        company,
        job,
        detail,
        date: formatDateString(anchorDate),
        amount: formatCurrency(invoice.amount ?? 0),
        status: displayStatus,
        statusTone,
        anchorDate,
        invoice,
      }
    })
  }, [invoicesQuery.data])

  const estimateRows = useMemo<EstimateRow[]>(() => {
    if (!estimatesQuery.data) return []
    return estimatesQuery.data.map((estimate) => {
      const displayStatus = formatEstimateStatus(estimate.status)
      const statusTone = estimateStatusStyles[displayStatus]?.tone ?? 'bg-slate-100 text-slate-600'
      const anchorDate = estimate.sentAtUtc ?? estimate.createdAtUtc
      const name = estimate.leadName || 'Unknown Lead'
      const company = estimate.leadCompany || estimate.companyName || '—'
      const project = estimate.description || 'Estimate'
      const detail = estimate.leadAddressLine1
        ? [estimate.leadAddressLine1, estimate.leadCity, estimate.leadState].filter(Boolean).join(', ')
        : estimate.leadEmail || '—'

      return {
        id: estimate.id,
        name,
        company,
        project,
        detail,
        date: formatDateString(anchorDate),
        amount: formatCurrency(estimate.amount ?? 0),
        status: displayStatus,
        statusTone,
        anchorDate,
        estimate,
      }
    })
  }, [estimatesQuery.data])

  const filteredInvoiceRows = useMemo(() => {
    return filterBillingRows(rows, searchTerm, statusFilter, dateFilter, (row) => [
      row.name,
      row.company,
      row.job,
      row.detail,
    ])
  }, [rows, searchTerm, statusFilter, dateFilter])

  const filteredEstimateRows = useMemo(() => {
    return filterBillingRows(estimateRows, searchTerm, statusFilter, dateFilter, (row) => [
      row.name,
      row.company,
      row.project,
      row.detail,
    ])
  }, [estimateRows, searchTerm, statusFilter, dateFilter])

  const activeRows = view === 'invoices' ? filteredInvoiceRows : filteredEstimateRows
  useAutoSelectedId<InvoiceRow | EstimateRow>({
    items: activeRows,
    selectedId,
    setSelectedId,
    getId: (row) => row.id,
  })

  useEffect(() => {
    setStatusFilter('All')
    setSelectedId(null)
    setOpenMenuId(null)
  }, [view])

  const selectedInvoice = filteredInvoiceRows.find((row) => row.id === selectedId)?.invoice ?? null
  const selectedEstimate = filteredEstimateRows.find((row) => row.id === selectedId)?.estimate ?? null
  const metrics = metricsQuery.data

  const estimateMetrics: EstimateMetrics = useMemo(() => {
    const estimates = estimatesQuery.data ?? []
    const utcNow = new Date()
    const y = utcNow.getUTCFullYear()
    const m = utcNow.getUTCMonth()
    const monthStart = new Date(Date.UTC(y, m, 1))
    const lastMonthStart = new Date(Date.UTC(y, m - 1, 1))
    const lastMonthEnd = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999))

    const pendingTotal = estimates
      .filter((estimate) => estimate.status === EstimateStatus.Draft || estimate.status === EstimateStatus.Sent)
      .reduce((sum, estimate) => sum + (estimate.amount ?? 0), 0)

    const pendingTotalLastMonth = estimates
      .filter((estimate) => estimate.status === EstimateStatus.Draft || estimate.status === EstimateStatus.Sent)
      .filter((estimate) => {
        const t = new Date(estimate.createdAtUtc).getTime()
        return t >= lastMonthStart.getTime() && t <= lastMonthEnd.getTime()
      })
      .reduce((sum, estimate) => sum + (estimate.amount ?? 0), 0)

    const sentThisMonth = estimates.filter(
      (estimate) => estimate.sentAtUtc && new Date(estimate.sentAtUtc).getTime() >= monthStart.getTime(),
    ).length

    const sentLastMonth = estimates.filter((estimate) => {
      if (!estimate.sentAtUtc) return false
      const t = new Date(estimate.sentAtUtc).getTime()
      return t >= lastMonthStart.getTime() && t <= lastMonthEnd.getTime()
    }).length

    const acceptedThisMonth = estimates.filter(
      (estimate) => estimate.acceptedAtUtc && new Date(estimate.acceptedAtUtc).getTime() >= monthStart.getTime(),
    ).length

    const acceptedLastMonth = estimates.filter((estimate) => {
      if (!estimate.acceptedAtUtc) return false
      const t = new Date(estimate.acceptedAtUtc).getTime()
      return t >= lastMonthStart.getTime() && t <= lastMonthEnd.getTime()
    }).length

    const completedCount = estimates.filter(
      (estimate) => estimate.status === EstimateStatus.Accepted || estimate.status === EstimateStatus.Rejected,
    ).length
    const acceptedCount = estimates.filter((estimate) => estimate.status === EstimateStatus.Accepted).length
    const conversionRate = completedCount > 0 ? Math.round((acceptedCount / completedCount) * 100) : 0

    const completedLastMonth = estimates.filter((estimate) => {
      const acceptedAt = estimate.acceptedAtUtc ? new Date(estimate.acceptedAtUtc).getTime() : 0
      const rejectedAt = estimate.rejectedAtUtc ? new Date(estimate.rejectedAtUtc).getTime() : 0
      const lastStart = lastMonthStart.getTime()
      const lastEnd = lastMonthEnd.getTime()
      return (acceptedAt >= lastStart && acceptedAt <= lastEnd) || (rejectedAt >= lastStart && rejectedAt <= lastEnd)
    }).length
    const conversionRateLastMonth =
      completedLastMonth > 0 ? Math.round((acceptedLastMonth / completedLastMonth) * 100) : 0

    return {
      pendingTotal,
      sentThisMonth,
      acceptedThisMonth,
      conversionRate,
      pendingTotalLastMonth,
      sentLastMonth,
      acceptedLastMonth,
      conversionRateLastMonth,
    }
  }, [estimatesQuery.data])


  const modals = [
    <InvoiceUpsertModal
      isOpen={createOpen}
      mode="create"
      jobs={jobsQuery.data ?? []}
      isSubmitting={createInvoiceMutation.isPending}
      onClose={() => setCreateOpen(false)}
      onSubmit={(payload) => createInvoiceMutation.mutate(payload)}
    />,
    <InvoiceUpsertModal
      isOpen={Boolean(editInvoice)}
      mode="edit"
      jobs={jobsQuery.data ?? []}
      invoice={editInvoice}
      isSubmitting={updateInvoiceMutation.isPending}
      onClose={() => setEditInvoice(null)}
      onSubmit={(payload) => {
        if (!editInvoice) return
        const { ...updatePayload } = payload
        updateInvoiceMutation.mutate({ id: editInvoice.id, payload: updatePayload })
      }}
    />,
    <InvoiceIssueModal
      isOpen={Boolean(issueInvoiceModal)}
      leadName={issueInvoiceModal?.leadName}
      isSubmitting={issueInvoiceMutation.isPending}
      onClose={() => setIssueInvoiceModal(null)}
      onSubmit={(payload) => {
        if (!issueInvoiceModal) return
        issueInvoiceMutation.mutate({ id: issueInvoiceModal.id, payload })
      }}
    />,
    <EstimateUpsertModal
      isOpen={createEstimateOpen}
      mode="create"
      leads={leadsQuery.data ?? []}
      isSubmitting={createEstimateMutation.isPending}
      onClose={() => setCreateEstimateOpen(false)}
      onSubmit={(payload) =>
        createEstimateMutation.mutate({
          leadId: payload.leadId,
          amount: payload.amount,
          description: payload.description,
          lineItems: payload.lineItems,
        })
      }
    />,
    <EstimateUpsertModal
      isOpen={Boolean(editEstimate)}
      mode="edit"
      leads={leadsQuery.data ?? []}
      estimate={editEstimate}
      isSubmitting={updateEstimateMutation.isPending}
      onClose={() => setEditEstimate(null)}
      onSubmit={(payload) => {
        if (!editEstimate) return
        updateEstimateMutation.mutate({
          id: editEstimate.id,
          payload: {
            description: payload.description,
            lineItems: payload.lineItems,
          },
        })
      }}
    />,
    <EstimateAcceptModal
      isOpen={Boolean(estimateAccept)}
      leadName={estimateAccept?.leadName}
      milestoneTemplates={estimateAccept?.milestoneTemplates}
      isSubmitting={acceptEstimateMutation.isPending || sendEstimateMutation.isPending}
      onClose={() => setEstimateAccept(null)}
      onSubmit={async (payload) => {
        if (!estimateAccept) return
        try {
          if (estimateAccept.needsSend) {
            await sendEstimateMutation.mutateAsync(estimateAccept.estimateId)
          }
          await acceptEstimateMutation.mutateAsync({ id: estimateAccept.estimateId, payload })
        } catch (error) {
          console.error(error)
        }
      }}
    />,
    <ConfirmDeleteModal
      isOpen={Boolean(confirmDelete)}
      title="Delete invoice"
      description={confirmDelete ? `This will permanently remove the invoice for ${confirmDelete.leadName}.` : ''}
      confirmLabel="Delete"
      onCancel={() => setConfirmDelete(null)}
      onConfirm={() => {
        if (!confirmDelete) return
        deleteInvoiceMutation.mutate(confirmDelete.id)
      }}
    />
  ]

  return (
    <AppLayout modals={modals}>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold">{view === 'invoices' ? 'Invoices' : 'Estimates'}</h1>
            <p className="text-xs text-slate-500">Manage pricing workflows and client approvals.</p>
          </div>
          <div className="flex items-center gap-4">
            <SegmentedControl
              value={view}
              options={[
                { label: 'Invoices', value: 'invoices' },
                { label: 'Estimates', value: 'estimates' },
              ]}
              onChange={(next) => setView(next as BillingView)}
            />
            {view === 'invoices' ? (
              <button
                className="btn btn-sm bg-primary text-white hover:bg-primary/90 gap-2"
                onClick={() => setCreateOpen(true)}
              >
                <span className="material-icons text-sm">add</span>
                Create Invoice
              </button>
            ) : (
              <button
                className="btn btn-sm bg-primary text-white hover:bg-primary/90 gap-2"
                onClick={() => setCreateEstimateOpen(true)}
              >
                <span className="material-icons text-sm">add</span>
                Create Estimate
              </button>
            )}
          </div>
        </header>

        <div className="p-8 space-y-8 flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {view === 'invoices' ? (
              <>
                {metrics && makeInvoiceStats(metrics).map((stat) => (
                  <StatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    current={stat.current}
                    previous={stat.previous}
                    icon={stat.icon}
                    tone={stat.tone}
                    meta={stat.meta}
                  />
                ))}
              </>
            ) : (
              <>
                {estimateMetrics && makeEstimateStats(estimateMetrics).map((stat) => (
                  <StatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    current={stat.current}
                    previous={stat.previous}
                    icon={stat.icon}
                    tone={stat.tone}
                    meta={stat.meta}
                  />
                ))}
              </>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <SectionCard title={view === 'invoices' ? 'Invoices' : 'Estimates'}>
              <div className="flex items-center justify-end gap-2 mb-6">
                <SearchInput
                  className="flex-1"
                  placeholder={
                    view === 'invoices'
                      ? 'Search customer, job, or address...'
                      : 'Search customer, estimate, or address...'
                  }
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
                <SegmentedControl
                  value={statusFilter}
                  options={view === 'invoices' ? invoiceStatusOptions : estimateStatusOptions}
                  onChange={setStatusFilter}
                />
                <select
                  className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                >
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="ytd">Year to Date</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                {view === 'invoices' ? (
                  <Table
                    header={[
                      {
                        label: 'Customer',
                        sortKey: 'name',
                      },
                      {
                        label: 'Job Details',
                        sortKey: 'job',
                      },
                      {
                        label: 'Date Issued',
                        sortKey: 'date',
                      },
                      {
                        label: 'Amount',
                        sortKey: 'amount',
                      },
                      {
                        label: 'Status',
                        sortKey: 'status',
                      },
                      {
                        label: 'Actions',
                        sortKey: 'actions',
                      },
                    ]}
                    actions={false}
                    rows={filteredInvoiceRows.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-primary/2 transition-colors group cursor-pointer ${selectedId === row.id ? 'bg-primary/4' : ''}`}
                        onClick={() => setSelectedId(row.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <InitialsAvatar name={row.name} />
                            <div>
                              <p className="font-medium text-sm">{row.name}</p>
                              <p className="text-xs text-slate-500">{row.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium">{row.job}</p>
                          <p className="text-xs text-slate-500">{row.detail}</p>
                        </td>
                        <td className="px-6 py-4 text-sm tabular-nums text-slate-600">{row.date}</td>
                        <td className="px-6 py-4 font-semibold text-sm tabular-nums">{row.amount}</td>
                        <td className="px-6 py-4 text-center">
                          <StatusPill label={row.status} tone={row.statusTone} />
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                          <ActionMenu
                            isOpen={openMenuId === row.id}
                            onOpenChange={(nextOpen) => setOpenMenuId(nextOpen ? row.id : null)}
                            items={[
                              {
                                label: 'Issue',
                                icon: 'receipt',
                                onClick: () => setIssueInvoiceModal(row.invoice),
                                disabled: row.status !== 'Draft',
                              },
                              {
                                label: 'Edit',
                                icon: 'edit',
                                onClick: () => setEditInvoice(row.invoice),
                                disabled: row.status !== 'Draft',
                              },
                              {
                                label: 'Download',
                                icon: 'download',
                                onClick: () => openInvoicePrintView(row.invoice, { autoPrint: true }),
                              },
                              {
                                label: 'Delete',
                                icon: 'delete',
                                onClick: () => setConfirmDelete(row.invoice),
                                disabled: row.status !== 'Draft',
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                    rowSortValues={filteredInvoiceRows.map((row) => ({
                      name: row.name,
                      job: row.job,
                      date: row.date,
                      amount: row.amount,
                      status: row.status,
                    }))}
                    loadingMessage='Loading invoices...'
                    isLoading={invoicesQuery.isLoading}
                    isError={invoicesQuery.isError}
                    errorMessage={invoicesQuery.error?.message || 'Unable to load invoices.'}
                    emptyMessage='No invoices match these filters.'
                  />
                ) : (
                  <Table
                    header={[
                      {
                        label: 'Customer',
                        sortKey: 'name',
                      },
                      {
                        label: 'Estimate Details',
                        sortKey: 'project',
                      },
                      {
                        label: 'Date',
                        sortKey: 'date',
                      },
                      {
                        label: 'Amount',
                        sortKey: 'amount',
                      },
                      {
                        label: 'Status',
                        sortKey: 'status',
                      },
                      {
                        label: 'Actions',
                        sortKey: 'actions',
                      },
                    ]}
                    actions={false}
                    rows={filteredEstimateRows.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-primary/2 transition-colors group cursor-pointer ${selectedId === row.id ? 'bg-primary/4' : ''}`}
                        onClick={() => setSelectedId(row.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <InitialsAvatar name={row.name} />
                            <div>
                              <p className="font-medium text-sm">{row.name}</p>
                              <p className="text-xs text-slate-500">{row.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium">{row.project}</p>
                          <p className="text-xs text-slate-500">{row.detail}</p>
                        </td>
                        <td className="px-6 py-4 text-sm tabular-nums text-slate-600">{row.date}</td>
                        <td className="px-6 py-4 font-semibold text-sm tabular-nums">{row.amount}</td>
                        <td className="px-6 py-4 text-center">
                          <StatusPill label={row.status} tone={row.statusTone} />
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                          <ActionMenu
                            isOpen={openMenuId === row.id}
                            onOpenChange={(nextOpen) => setOpenMenuId(nextOpen ? row.id : null)}
                            items={[
                              {
                                label: 'Send to Client',
                                icon: 'send',
                                onClick: () => sendEstimateMutation.mutate(row.estimate.id),
                                disabled: row.status !== 'Draft',
                              },
                              {
                                label: 'Edit',
                                icon: 'edit',
                                onClick: () => setEditEstimate(row.estimate),
                                disabled: row.status !== 'Draft',
                              },
                              {
                                label: 'Mark as Accepted',
                                icon: 'check_circle',
                                onClick: () => setEstimateAccept({
                                  estimateId: row.estimate.id,
                                  leadName: row.estimate.leadName,
                                  needsSend: row.status === 'Draft',
                                  milestoneTemplates: row.estimate.lineItems
                                    .filter((line) => !line.isTaxLine)
                                    .map((line) => ({ title: line.description })),
                                }),
                                disabled: row.status !== 'Sent',
                              },
                              {
                                label: 'Mark as Rejected',
                                icon: 'cancel',
                                onClick: () => rejectEstimateMutation.mutate(row.estimate.id),
                                disabled: row.status !== 'Sent',
                                className: 'text-rose-600',
                              },
                              {
                                label: 'Download',
                                icon: 'download',
                                onClick: () => openEstimatePrintView(row.estimate, { autoPrint: true }),
                              },

                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                    rowSortValues={filteredEstimateRows.map((row) => ({
                      name: row.name,
                      project: row.project,
                      date: row.date,
                      amount: row.amount,
                      status: row.status,
                    }))}
                    loadingMessage='Loading estimates...'
                    isLoading={estimatesQuery.isLoading}
                    isError={estimatesQuery.isError}
                    errorMessage={estimatesQuery.error?.message || 'Unable to load estimates.'}
                    emptyMessage='No estimates match these filters.'
                  />
                )}
              </div>
            </SectionCard>

            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {view === 'invoices'
                  ? `Showing ${filteredInvoiceRows.length} of ${rows.length} invoices`
                  : `Showing ${filteredEstimateRows.length} of ${estimateRows.length} estimates`}
              </span>
            </div>
          </div>

          {view === 'invoices' ? (
            selectedInvoice ? (
              <InvoiceDetails
                invoice={selectedInvoice}
                onMarkPaid={() => markPaidMutation.mutate(selectedInvoice.id)}
                onIssue={() => setIssueInvoiceModal(selectedInvoice)}
                onEdit={() => setEditInvoice(selectedInvoice)}
                onDelete={() => setConfirmDelete(selectedInvoice)}
              />
            ) : (
              <aside className="w-full lg:w-96 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-fit p-6 text-center text-sm text-slate-500">
                No invoice selected.
              </aside>
            )
          ) : selectedEstimate ? (
            <EstimateDetails
              estimate={selectedEstimate}
              onSend={() => sendEstimateMutation.mutate(selectedEstimate.id)}
              onAccept={() =>
                setEstimateAccept({
                  estimateId: selectedEstimate.id,
                  leadName: selectedEstimate.leadName,
                  needsSend: selectedEstimate.status === EstimateStatus.Draft,
                  milestoneTemplates: selectedEstimate.lineItems
                    .filter((line) => !line.isTaxLine)
                    .map((line) => ({ title: line.description })),
                })
              }
              onReject={() => rejectEstimateMutation.mutate(selectedEstimate.id)}
              onEdit={() => setEditEstimate(selectedEstimate)}
            />
          ) : (
            <aside className="w-full lg:w-96 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-fit p-6 text-center text-sm text-slate-500">
              No estimate selected.
            </aside>
          )}
        </div>
      </main>
    </AppLayout>
  )
}

type FilterableRow = {
  status: string
  anchorDate: string
}

function filterBillingRows<T extends FilterableRow>(
  rows: T[],
  searchTerm: string,
  statusFilter: string,
  dateFilter: string,
  getSearchValues: (row: T) => Array<string | null | undefined>,
) {
  const term = searchTerm.trim().toLowerCase()
  const dateCutoff = resolveDateCutoff(dateFilter)

  return rows
    .filter((row) => {
      if (statusFilter !== 'All' && row.status !== statusFilter) return false
      if (dateCutoff && new Date(row.anchorDate) < dateCutoff) return false
      if (!term) return true
      return getSearchValues(row)
        .filter(Boolean)
        .some((value) => value && value.toLowerCase().includes(term))
    })
    .sort((a, b) => new Date(b.anchorDate).getTime() - new Date(a.anchorDate).getTime())
}
