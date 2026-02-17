import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ExcellentExport from 'excellentexport'
import { deleteLead, getLeadMetrics, leadsQueryOptions } from '../../api/leads'
import { companiesQueryOptions, deleteCompany } from '../../api/companies'
import { LeadCreateModal } from '../../components/modals/LeadCreateModal'
import { CompanyModal } from '../../components/modals/CompanyModal'
import { queryKeys } from '../../api/queryKeys'
import type { LeadMetricsResponse } from '../../api'
import { AppLayout } from '../AppLayout'
import { Table } from '../../components/table/Table'
import { ActionMenu } from '../../components/table/ActionMenu'
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal'
import { StatCard } from '../../components/StatCard'

type LeadRow = {
  id: string
  initials: string
  name: string
  company: string
  email: string
  phone: string
  created: string
  status: string
  statusTone: string
  isDeleted: boolean
  createdAtUtc: string
}

type CompanyRow = {
  id: string
  name: string
  phone: string
  email: string
  website: string
  address: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  taxId: string
  updated: string
  updatedAtUtc: string
  createdAtUtc: string
  isDeleted: boolean
}

type LeadPrefill = {
  name?: string
  company?: string
  email?: string
  phone?: string
}

type CompanyPrefill = {
  name?: string
  phone?: string
  email?: string
  website?: string
  notes?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  taxId?: string
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

function parseDateValue(value?: string) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function isWithinRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end
}

function resolveCompanyStatsRange(filter: string) {
  const now = new Date()
  const end = new Date(now)
  let start = new Date(now.getTime() - 30 * DAY_IN_MS)

  if (filter === '90') {
    start = new Date(now.getTime() - 90 * DAY_IN_MS)
  } else if (filter === 'ytd') {
    start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
  } else if (filter === 'all') {
    start = new Date(now.getTime() - 30 * DAY_IN_MS)
  }

  const span = end.getTime() - start.getTime()
  const previousEnd = new Date(start)
  const previousStart = new Date(start.getTime() - span)

  return { start, end, previousStart, previousEnd }
}

export function LeadsPage() {
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [editLeadId, setEditLeadId] = useState<string | null>(null)
  const [editCompanyId, setEditCompanyId] = useState<string | null>(null)
  const [leadPrefill, setLeadPrefill] = useState<LeadPrefill | null>(null)
  const [companyPrefill, setCompanyPrefill] = useState<CompanyPrefill | null>(null)
  const [viewMode, setViewMode] = useState<'leads' | 'companies'>('leads')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('30')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'lead' | 'company'
    id: string
    label: string
  } | null>(null)

  const queryClient = useQueryClient()

  const includeDeletedLeads = statusFilter === 'Deleted'

  const leadsQuery = useQuery(leadsQueryOptions(includeDeletedLeads))
  const companiesQuery = useQuery({
    ...companiesQueryOptions(true),
    enabled: viewMode === 'companies',
  })
  const metricsQuery = useQuery({
    queryKey: queryKeys.leads.metrics(),
    queryFn: getLeadMetrics,
    enabled: viewMode === 'leads',
  })

  const deleteLeadMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(false) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(true) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.metrics() })
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
    },
  })
  const deleteCompanyMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list(false) })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list(true) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(false) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(true) })
    },
  })

  const rows = useMemo<LeadRow[]>(() => {
    if (!leadsQuery.data) return []
    return leadsQuery.data.map((lead) => {
      const name = lead.name || 'Unnamed Lead'
      const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((chunk) => chunk[0]?.toUpperCase())
        .join('')
      const status = lead.isDeleted
        ? 'Deleted'
        : lead.status === 0
          ? 'New Lead'
          : lead.status === 1
            ? 'Lost'
            : 'Converted'
      const statusTone = lead.isDeleted
        ? 'bg-slate-100 text-slate-500'
        : status === 'Converted'
          ? 'bg-emerald-100 text-emerald-700'
          : status === 'Lost'
            ? 'bg-rose-100 text-rose-700'
            : 'bg-blue-100 text-blue-800'

      return {
        id: lead.id,
        initials: initials || 'LD',
        name,
        company: lead.company ?? '—',
        email: lead.email ?? '—',
        phone: lead.phone ?? '—',
        created: new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date(lead.createdAtUtc)),
        status,
        statusTone,
        isDeleted: Boolean(lead.isDeleted),
        createdAtUtc: lead.createdAtUtc,
      }
    })
  }, [leadsQuery.data])

  const companyRows = useMemo<CompanyRow[]>(() => {
    if (!companiesQuery.data) return []
    return companiesQuery.data.map((company) => {
      const address = [
        company.addressLine1,
        company.addressLine2,
        company.city,
        company.state,
        company.postalCode,
      ]
        .filter(Boolean)
        .join(', ')
      const updatedAtUtc = company.updatedAtUtc ?? company.createdAtUtc ?? ''
      return {
        id: company.id,
        name: company.name,
        phone: company.phone ?? '—',
        email: company.email ?? '—',
        website: company.website ?? '—',
        address: address || '—',
        addressLine1: company.addressLine1 ?? '',
        addressLine2: company.addressLine2 ?? '',
        city: company.city ?? '',
        state: company.state ?? '',
        postalCode: company.postalCode ?? '',
        taxId: company.taxId ?? '—',
        updated: updatedAtUtc
          ? new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(new Date(updatedAtUtc))
          : '—',
        updatedAtUtc,
        createdAtUtc: company.createdAtUtc ?? '',
        isDeleted: Boolean(company.isDeleted),
      }
    })
  }, [companiesQuery.data])

  const filteredLeadRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const now = new Date()
    const dateCutoff =
      dateFilter === 'all'
        ? null
        : dateFilter === '90'
          ? new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          : dateFilter === 'ytd'
            ? new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
            : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return rows.filter((row) => {
      if (statusFilter === 'Deleted' && !row.isDeleted) return false
      if (statusFilter === 'New' && row.status !== 'New Lead') return false
      if (statusFilter === 'Lost' && row.status !== 'Lost') return false
      if (statusFilter === 'Converted' && row.status !== 'Converted') return false
      if (dateCutoff && new Date(row.createdAtUtc) < dateCutoff) return false

      if (!term) return true
      return [row.name, row.company, row.email, row.phone].some((value) => value.toLowerCase().includes(term))
    })
  }, [rows, searchTerm, statusFilter, dateFilter])

  const filteredCompanyRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const now = new Date()
    const dateCutoff =
      dateFilter === 'all'
        ? null
        : dateFilter === '90'
          ? new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          : dateFilter === 'ytd'
            ? new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
            : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return companyRows.filter((row) => {
      if (statusFilter === 'Deleted' && !row.isDeleted) return false
      if (statusFilter === 'Active' && row.isDeleted) return false
      if (dateCutoff) {
        const anchorDate = row.updatedAtUtc || row.createdAtUtc
        if (anchorDate && new Date(anchorDate) < dateCutoff) return false
      }

      if (!term) return true
      return [row.name, row.address, row.email, row.phone, row.website, row.taxId]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [companyRows, searchTerm, statusFilter, dateFilter])

  const metrics: LeadMetricsResponse | null = metricsQuery.data ?? null
  const conversionRate = metrics ? Math.round(metrics.conversionRate * 100) : 0
  const leadsWithSent = metrics?.leadsWithSentEstimatesThisMonth ?? 0
  const newLeadsThisMonth = metrics?.newLeadsThisMonth ?? 0
  const newLeadsLastMonth = metrics?.newLeadsLastMonth ?? 0
  const leadsWithSentLastMonth = metrics?.leadsWithSentEstimatesLastMonth ?? 0
  const conversionRateLastMonth = metrics ? Math.round(metrics.conversionRateLastMonth * 100) : 0

  const companyStats = useMemo(() => {
    const { start, end, previousStart, previousEnd } = resolveCompanyStatsRange(dateFilter)

    const createdInRange = (row: CompanyRow, rangeStart: Date, rangeEnd: Date) => {
      const createdAt = parseDateValue(row.createdAtUtc)
      return createdAt ? isWithinRange(createdAt, rangeStart, rangeEnd) : false
    }

    const deletedInRange = (row: CompanyRow, rangeStart: Date, rangeEnd: Date) => {
      if (!row.isDeleted) return false
      const deletedAt = parseDateValue(row.updatedAtUtc) ?? parseDateValue(row.createdAtUtc)
      return deletedAt ? isWithinRange(deletedAt, rangeStart, rangeEnd) : false
    }

    const totalCompanies = companyRows.length
    const activeCompanies = companyRows.filter((company) => !company.isDeleted).length
    const deletedCompanies = companyRows.filter((company) => company.isDeleted).length

    const totalCurrent = companyRows.filter((row) => createdInRange(row, start, end)).length
    const totalPrevious = companyRows.filter((row) => createdInRange(row, previousStart, previousEnd)).length
    const activeCurrent = companyRows.filter((row) => !row.isDeleted && createdInRange(row, start, end)).length
    const activePrevious = companyRows.filter((row) => !row.isDeleted && createdInRange(row, previousStart, previousEnd)).length
    const deletedCurrent = companyRows.filter((row) => deletedInRange(row, start, end)).length
    const deletedPrevious = companyRows.filter((row) => deletedInRange(row, previousStart, previousEnd)).length

    return {
      totalCompanies,
      activeCompanies,
      deletedCompanies,
      totalCurrent,
      totalPrevious,
      activeCurrent,
      activePrevious,
      deletedCurrent,
      deletedPrevious,
    }
  }, [companyRows, dateFilter])

  const handleExport = () => {
    const filename = viewMode === 'leads' ? 'leads' : 'companies'
    const data =
      viewMode === 'leads'
        ? [
          ['Name', 'Company', 'Email', 'Phone', 'Status', 'Created'],
          ...filteredLeadRows.map((row) => [
            row.name,
            row.company,
            row.email,
            row.phone,
            row.status,
            row.created,
          ]),
        ]
        : [
          ['Company', 'Address', 'Phone', 'Email', 'Website', 'Tax ID', 'Updated'],
          ...filteredCompanyRows.map((row) => [
            row.name,
            row.address,
            row.phone,
            row.email,
            row.website,
            row.taxId,
            row.updated,
          ]),
        ]
    ExcellentExport.convert(
      { openAsDownload: true, format: 'csv', filename },
      [{ name: filename, from: { array: data } }],
    )
  }

  const isLoading = viewMode === 'leads' ? leadsQuery.isLoading : companiesQuery.isLoading
  const isError = viewMode === 'leads' ? leadsQuery.isError : companiesQuery.isError
  const errorMessage =
    viewMode === 'leads'
      ? leadsQuery.error?.message || 'Unable to load leads.'
      : companiesQuery.error?.message || 'Unable to load companies.'

  const modals = [
    <LeadCreateModal
      isOpen={isCreateLeadOpen}
      onClose={() => {
        setIsCreateLeadOpen(false)
        setLeadPrefill(null)
      }}
      initialData={leadPrefill ?? undefined}
    />,
    <LeadCreateModal
      isOpen={Boolean(editLeadId)}
      onClose={() => setEditLeadId(null)}
      leadId={editLeadId ?? undefined}
    />,
    <CompanyModal
      isOpen={isCompanyModalOpen}
      onClose={() => {
        setIsCompanyModalOpen(false)
        setCompanyPrefill(null)
      }}
      initialData={companyPrefill ?? undefined}
    />,
    <CompanyModal
      isOpen={Boolean(editCompanyId)}
      onClose={() => setEditCompanyId(null)}
      companyId={editCompanyId ?? undefined}
    />,
    <ConfirmDeleteModal
      isOpen={Boolean(confirmDelete)}
      title={confirmDelete?.type === 'lead' ? 'Delete lead' : 'Delete company'}
      description={
        confirmDelete
          ? `This will mark ${confirmDelete.label} as deleted. You can still view it by selecting the Deleted filter.`
          : ''
      }
      confirmLabel="Delete"
      onCancel={() => setConfirmDelete(null)}
      onConfirm={() => {
        if (!confirmDelete) return
        if (confirmDelete.type === 'lead') {
          deleteLeadMutation.mutate(confirmDelete.id)
        } else {
          deleteCompanyMutation.mutate(confirmDelete.id)
        }
        setConfirmDelete(null)
      }}
    />,
  ]

  return (
    <AppLayout modals={modals}>
      <div className="flex min-h-screen">
        <main className="flex-1 p-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">Leads &amp; Customer Management</h1>
              <p className="text-slate-500 text-sm">
                Manage your pipeline and customer relationships in one place.
              </p>
            </div>
          </header>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder={viewMode === 'leads' ? 'Search by name, email or company...' : 'Search by company, address, or contact...'}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <select
                className="bg-slate-50 border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-primary text-slate-600"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {viewMode === 'leads' ? (
                  <>
                    <option value="All">All Statuses</option>
                    <option value="New">New Lead</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                    <option value="Deleted">Deleted</option>
                  </>
                ) : (
                  <>
                    <option value="Active">Active</option>
                    <option value="Deleted">Deleted</option>
                  </>
                )}
              </select>
              <select
                className="bg-slate-50 border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-primary text-slate-600"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              >
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="ytd">Year to Date</option>
                <option value="all">All Time</option>
              </select>
              <button
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                onClick={handleExport}
              >
                <span className="material-icons text-lg">file_download</span>
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${viewMode === 'leads' ? 'bg-primary text-white' : 'text-slate-500'
                  }`}
                onClick={() => setViewMode('leads')}
              >
                Leads
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${viewMode === 'companies' ? 'bg-primary text-white' : 'text-slate-500'
                  }`}
                onClick={() => setViewMode('companies')}
              >
                Companies
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {viewMode === 'leads' ? (
                <button
                  className="btn btn-sm bg-primary text-white hover:bg-primary/90"
                  onClick={() => setIsCreateLeadOpen(true)}
                >
                  <span className="material-icons text-sm">add</span>
                  New Lead
                </button>
              ) : (
                <button
                  className="btn btn-sm bg-primary text-white hover:bg-primary/90"
                  onClick={() => setIsCompanyModalOpen(true)}
                >
                  <span className="material-icons text-sm">domain_add</span>
                  New Company
                </button>
              )}
            </div>
          </div>

          {viewMode === 'leads' ? (
            <Table
              rows={(filteredLeadRows as LeadRow[]).map((row: LeadRow) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {row.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="text-xs text-slate-500">{row.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="material-icons text-base">email</span>
                        <span>{row.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="material-icons text-base">phone</span>
                        <span>{row.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-slate-600">{row.created}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.statusTone}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ActionMenu
                      isOpen={openMenuId === `lead-${row.id}`}
                      onOpenChange={(nextOpen) =>
                        setOpenMenuId(nextOpen ? `lead-${row.id}` : null)
                      }
                      items={[
                        {
                          label: 'Contact',
                          icon: 'call',
                          onClick: () => {
                            if (row.email !== '—') window.location.href = `mailto:${row.email}`
                            else if (row.phone !== '—') window.location.href = `tel:${row.phone}`
                          },
                          disabled: row.email === '—' && row.phone === '—',
                        },
                        {
                          label: 'Edit',
                          icon: 'edit',
                          onClick: () => setEditLeadId(row.id),
                        },
                        {
                          label: 'Clone',
                          icon: 'content_copy',
                          onClick: () => {
                            setLeadPrefill({
                              name: `Copy of ${row.name}`,
                              company: row.company === '—' ? '' : row.company,
                              email: row.email === '—' ? '' : row.email,
                              phone: row.phone === '—' ? '' : row.phone,
                            })
                            setIsCreateLeadOpen(true)
                          },
                        },
                        {
                          label: 'Delete',
                          icon: 'delete',
                          onClick: () => {
                            if (row.isDeleted) return
                            setConfirmDelete({ type: 'lead', id: row.id, label: row.name })
                          },
                          disabled: row.isDeleted,
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
              rowSortValues={filteredLeadRows.map((row) => ({
                name: row.name,
                company: row.company,
                status: row.status,
                created: new Date(row.createdAtUtc).getTime(),
              }))}
              loadingMessage='Loading leads...'
              isLoading={isLoading}
              isError={isError}
              errorMessage={errorMessage}
              emptyMessage="No leads match these filters."
              actions={true}
              pageSize={5}
              initialSortKey="created"
              initialSortDirection="desc"
              header={[
                { label: 'Client / Company', sortKey: 'name' },
                { label: 'Contact Details', sortKey: 'company' },
                { label: 'Created Date', sortKey: 'created', align: 'center' as const },
                { label: 'Status', sortKey: 'status', align: 'center' as const },
              ]}
            />
          ) : (
            <Table
              rows={(filteredCompanyRows as CompanyRow[]).map((row: CompanyRow) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{row.name}</p>
                    {row.isDeleted ? (
                      <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                        Deleted
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.address}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="material-icons text-base">email</span>
                        <span>{row.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="material-icons text-base">phone</span>
                        <span>{row.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.taxId}</td>
                  <td className="px-6 py-4 text-sm text-center text-slate-600">{row.updated}</td>
                  <td className="px-6 py-4 text-right">
                    <ActionMenu
                      isOpen={openMenuId === `company-${row.id}`}
                      onOpenChange={(nextOpen) =>
                        setOpenMenuId(nextOpen ? `company-${row.id}` : null)
                      }
                      items={[
                        {
                          label: 'Contact',
                          icon: 'call',
                          onClick: () => {
                            if (row.email !== '—') window.location.href = `mailto:${row.email}`
                            else if (row.phone !== '—') window.location.href = `tel:${row.phone}`
                          },
                          disabled: row.email === '—' && row.phone === '—',
                        },
                        {
                          label: 'Edit',
                          icon: 'edit',
                          onClick: () => setEditCompanyId(row.id),
                        },
                        {
                          label: 'Clone',
                          icon: 'content_copy',
                          onClick: () => {
                            setCompanyPrefill({
                              name: `Copy of ${row.name}`,
                              phone: row.phone === '—' ? '' : row.phone,
                              email: row.email === '—' ? '' : row.email,
                              website: row.website === '—' ? '' : row.website,
                              addressLine1: row.addressLine1,
                              addressLine2: row.addressLine2,
                              city: row.city,
                              state: row.state,
                              postalCode: row.postalCode,
                              taxId: row.taxId === '—' ? '' : row.taxId,
                            })
                            setIsCompanyModalOpen(true)
                          },
                        },
                        {
                          label: 'Delete',
                          icon: 'delete',
                          onClick: () => {
                            if (row.isDeleted) return
                            setConfirmDelete({ type: 'company', id: row.id, label: row.name })
                          },
                          disabled: row.isDeleted,
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              loadingMessage='Loading companies...'
              isLoading={isLoading}
              isError={isError}
              errorMessage={errorMessage}
              emptyMessage="No companies match these filters."
              pageSize={5}
              rowSortValues={filteredCompanyRows.map((row) => ({
                name: row.name,
                address: row.address ?? '',
                email: row.email ?? '',
                taxId: row.taxId ?? '',
                updated: new Date(row.updatedAtUtc).getTime(),
              }))}
              initialSortKey="name"
              initialSortDirection="desc"
              header={[
                { label: 'Company', sortKey: 'name' },
                { label: 'Address', sortKey: 'address' },
                { label: 'Contact', sortKey: 'email' },
                { label: 'Tax ID', sortKey: 'taxId' },
              ]}
              actions={true}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {viewMode === 'leads' ? (
              <>
                <StatCard
                  label="New Leads This Month"
                  value={String(newLeadsThisMonth)}
                  current={newLeadsThisMonth}
                  previous={newLeadsLastMonth}
                  icon="trending_up"
                  tone="text-primary"
                />
                <StatCard
                  label="Leads → Sent Estimates (This Month)"
                  value={String(leadsWithSent)}
                  current={leadsWithSent}
                  previous={leadsWithSentLastMonth}
                  icon="assignment_turned_in"
                  tone="text-emerald-600"
                />
                <StatCard
                  label="Lead → Job Conversion Rate"
                  value={`${conversionRate}%`}
                  current={conversionRate}
                  previous={conversionRateLastMonth}
                  icon="pie_chart"
                  tone="text-amber-600"
                />
              </>
            ) : (
              <>
                <StatCard
                  label="Total Companies"
                  value={String(companyStats.totalCompanies)}
                  current={companyStats.totalCurrent}
                  previous={companyStats.totalPrevious}
                  icon="domain"
                  tone="text-primary"
                />
                <StatCard
                  label="Active Companies"
                  value={String(companyStats.activeCompanies)}
                  current={companyStats.activeCurrent}
                  previous={companyStats.activePrevious}
                  icon="business_center"
                  tone="text-emerald-600"
                />
                <StatCard
                  label="Deleted Companies"
                  value={String(companyStats.deletedCompanies)}
                  current={companyStats.deletedCurrent}
                  previous={companyStats.deletedPrevious}
                  icon="delete"
                  tone="text-amber-600"
                />
              </>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  )
}
