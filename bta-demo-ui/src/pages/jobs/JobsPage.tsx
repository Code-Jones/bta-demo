import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppSidebar } from '../../components/AppSidebar'
import {
  cancelJob,
  completeJob,
  createJob,
  createJobExpense,
  createJobMilestone,
  deleteJobExpense,
  deleteJobMilestone,
  jobDetailQueryOptions,
  jobsQueryOptions,
  startJob,
  updateJobExpense,
  updateJobMilestone,
} from '../../api/jobs'
import { queryKeys } from '../../api/queryKeys'
import type { JobDetailResponse, JobExpenseResponse, JobMilestoneResponse, JobListResponse } from '../../api'
import { MilestoneStatus } from '../../api'
import { leadsQueryOptions } from '../../api/leads'
import { EstimateAcceptModal } from '../../components/modals/EstimateAcceptModal'
import { SearchInput } from '../../components/SearchInput'
import { SegmentedControl } from '../../components/SegmentedControl'
import { StatusPill } from '../../components/StatusPill'
import { useAutoSelectedId } from '../../hooks/useAutoSelectedId'
import { formatCurrency, resolveDateCutoff } from '../../utils'

type JobRow = {
  id: string
  customer: string
  address: string
  estimateId: string
  startAtUtc: string
  estimatedEndAtUtc: string
  status: string
  statusTone: string
  highlight?: boolean
}

type CalendarView = 'list' | 'calendar'
type CalendarMode = 'month' | 'week'

type MilestoneFormState = {
  title: string
  notes: string
  status: MilestoneStatus
  occurredAtUtc: string
}

const statusStyles: Record<string, { label: string; tone: string; highlight?: boolean }> = {
  Scheduled: { label: 'Scheduled', tone: 'bg-primary/10 text-primary', highlight: true },
  InProgress: { label: 'In Progress', tone: 'bg-amber-100 text-amber-700' },
  Completed: { label: 'Completed', tone: 'bg-emerald-100 text-emerald-700' },
  Cancelled: { label: 'Cancelled', tone: 'bg-slate-100 text-slate-600' },
}

const dayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function JobsPage() {
  const [view, setView] = useState<CalendarView>('list')
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month')
  const [calendarAnchor, setCalendarAnchor] = useState(() => new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('30')
  const [sortKey, setSortKey] = useState<'start' | 'end' | 'customer' | 'status'>('start')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [createJobOpen, setCreateJobOpen] = useState(false)
  const [milestoneForm, setMilestoneForm] = useState<MilestoneFormState>({
    title: '',
    notes: '',
    status: MilestoneStatus.Pending,
    occurredAtUtc: '',
  })
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null)
  const [expenseForm, setExpenseForm] = useState({
    vendor: '',
    category: '',
    amount: '',
    spentAtUtc: '',
    notes: '',
    receipt: null as File | null,
  })
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)

  const resetMilestoneForm = useCallback(() => {
    setMilestoneForm({
      title: '',
      notes: '',
      status: MilestoneStatus.Pending,
      occurredAtUtc: '',
    })
    setEditingMilestoneId(null)
  }, [])

  const resetExpenseForm = useCallback(() => {
    setExpenseForm({
      vendor: '',
      category: '',
      amount: '',
      spentAtUtc: '',
      notes: '',
      receipt: null,
    })
    setEditingExpenseId(null)
  }, [])

  const queryClient = useQueryClient()
  const jobsQuery = useQuery(jobsQueryOptions())
  const leadsQuery = useQuery(leadsQueryOptions())
  const jobDetailQuery = useQuery(jobDetailQueryOptions(selectedJobId ?? ''))

  const startJobMutation = useMutation({
    mutationFn: startJob,
    onSuccess: () => invalidateJobs(),
  })

  const completeJobMutation = useMutation({
    mutationFn: completeJob,
    onSuccess: () => invalidateJobs(),
  })

  const cancelJobMutation = useMutation({
    mutationFn: cancelJob,
    onSuccess: () => invalidateJobs(),
  })

  const addMilestoneMutation = useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: { title: string; notes?: string; status?: MilestoneStatus; occurredAtUtc?: string } }) =>
      createJobMilestone(jobId, payload),
    onSuccess: () => {
      invalidateJobs()
      resetMilestoneForm()
    },
  })

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ jobId, milestoneId, payload }: { jobId: string; milestoneId: string; payload: { title?: string | null; notes?: string | null; status?: MilestoneStatus | null; occurredAtUtc?: string | null } }) =>
      updateJobMilestone(jobId, milestoneId, payload),
    onSuccess: () => {
      invalidateJobs()
      resetMilestoneForm()
    },
  })

  const reorderMilestonesMutation = useMutation({
    mutationFn: async ({ jobId, milestones }: { jobId: string; milestones: JobMilestoneResponse[] }) => {
      await Promise.all(
        milestones.map((milestone, index) =>
          updateJobMilestone(jobId, milestone.id, { sortOrder: index + 1 }),
        ),
      )
    },
    onSuccess: invalidateJobs,
  })

  const deleteMilestoneMutation = useMutation({
    mutationFn: ({ jobId, milestoneId }: { jobId: string; milestoneId: string }) => deleteJobMilestone(jobId, milestoneId),
    onSuccess: invalidateJobs,
  })

  const addExpenseMutation = useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: { vendor: string; category?: string | null; amount: number; spentAtUtc: string; notes?: string | null; receipt?: File | null } }) =>
      createJobExpense(jobId, payload),
    onSuccess: () => {
      invalidateJobs()
      resetExpenseForm()
    },
  })

  const updateExpenseMutation = useMutation({
    mutationFn: ({ jobId, expenseId, payload }: { jobId: string; expenseId: string; payload: { vendor?: string | null; category?: string | null; amount?: number | null; spentAtUtc?: string | null; notes?: string | null; receipt?: File | null } }) =>
      updateJobExpense(jobId, expenseId, payload),
    onSuccess: () => {
      invalidateJobs()
      resetExpenseForm()
    },
  })

  const deleteExpenseMutation = useMutation({
    mutationFn: ({ jobId, expenseId }: { jobId: string; expenseId: string }) => deleteJobExpense(jobId, expenseId),
    onSuccess: invalidateJobs,
  })

  const createJobMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      invalidateJobs()
      setCreateJobOpen(false)
    },
  })

  function invalidateJobs() {
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.list() })
    if (selectedJobId) queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(selectedJobId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
  }

  const rows = useMemo<JobRow[]>(() => {
    if (!jobsQuery.data) return []
    return jobsQuery.data.map((job) => mapJobRow(job))
  }, [jobsQuery.data])

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const dateCutoff = resolveDateCutoff(dateFilter)

    return rows
      .filter((row) => {
        if (statusFilter !== 'All' && row.status !== statusFilter) return false
        if (dateCutoff && new Date(row.startAtUtc) < dateCutoff) return false
        if (!term) return true
        return [row.customer, row.address, row.estimateId]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term))
      })
      .sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1
        switch (sortKey) {
          case 'customer':
            return direction * a.customer.localeCompare(b.customer)
          case 'status':
            return direction * a.status.localeCompare(b.status)
          case 'end':
            return direction * (new Date(a.estimatedEndAtUtc).getTime() - new Date(b.estimatedEndAtUtc).getTime())
          case 'start':
          default:
            return direction * (new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime())
        }
      })
  }, [rows, searchTerm, statusFilter, dateFilter, sortKey, sortDirection])

  const pageSize = 8
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  if (page > pageCount) setPage(pageCount)
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)

  useAutoSelectedId({
    items: filteredRows,
    selectedId: selectedJobId,
    setSelectedId: setSelectedJobId,
    getId: (row) => row.id,
  })

  useEffect(() => {
    queueMicrotask(() => {
      resetMilestoneForm()
      resetExpenseForm()
    })
  }, [selectedJobId, resetMilestoneForm, resetExpenseForm])

  const selectedJob = jobDetailQuery.data ?? null
  const milestoneProgress = computeMilestoneProgress(selectedJob)
  const milestoneTotal = selectedJob?.milestones.length ?? 0
  const isLoading = jobsQuery.isLoading
  const hasError = jobsQuery.isError

  const handleMilestoneSubmit = (jobId: string) => {
    if (!milestoneForm.title.trim()) return
    const occurredAtUtc = milestoneForm.occurredAtUtc
      ? new Date(milestoneForm.occurredAtUtc).toISOString()
      : new Date().toISOString()

    if (editingMilestoneId) {
      updateMilestoneMutation.mutate({
        jobId,
        milestoneId: editingMilestoneId,
        payload: {
          title: milestoneForm.title.trim(),
          notes: milestoneForm.notes.trim() || null,
          status: milestoneForm.status,
          occurredAtUtc,
        },
      })
    } else {
      addMilestoneMutation.mutate({
        jobId,
        payload: {
          title: milestoneForm.title.trim(),
          notes: milestoneForm.notes.trim() || undefined,
          status: milestoneForm.status,
          occurredAtUtc,
        },
      })
    }
  }

  const handleExpenseSubmit = (jobId: string) => {
    if (!expenseForm.vendor.trim() || !expenseForm.amount) return
    const amountValue = Number(expenseForm.amount)
    if (Number.isNaN(amountValue) || amountValue <= 0) return
    const spentAtUtc = expenseForm.spentAtUtc
      ? new Date(expenseForm.spentAtUtc).toISOString()
      : new Date().toISOString()

    if (editingExpenseId) {
      updateExpenseMutation.mutate({
        jobId,
        expenseId: editingExpenseId,
        payload: {
          vendor: expenseForm.vendor.trim(),
          category: expenseForm.category.trim() || null,
          amount: amountValue,
          spentAtUtc,
          notes: expenseForm.notes.trim() || null,
          receipt: expenseForm.receipt ?? null,
        },
      })
    } else {
      addExpenseMutation.mutate({
        jobId,
        payload: {
          vendor: expenseForm.vendor.trim(),
          category: expenseForm.category.trim() || null,
          amount: amountValue,
          spentAtUtc,
          notes: expenseForm.notes.trim() || null,
          receipt: expenseForm.receipt ?? null,
        },
      })
    }
  }

  const setMilestoneFormFromMilestone = (milestone: JobMilestoneResponse) => {
    setMilestoneForm({
      title: milestone.title,
      notes: milestone.notes ?? '',
      status: milestone.status,
      occurredAtUtc: toLocalInputValue(new Date(milestone.occurredAtUtc)),
    })
    setEditingMilestoneId(milestone.id)
  }

  const setExpenseFormFromExpense = (expense: JobExpenseResponse) => {
    setExpenseForm({
      vendor: expense.vendor,
      category: expense.category ?? '',
      amount: String(expense.amount),
      spentAtUtc: toLocalInputValue(new Date(expense.spentAtUtc)),
      notes: expense.notes ?? '',
      receipt: null,
    })
    setEditingExpenseId(expense.id)
  }

  return (
    <div className="bg-background-light text-slate-900">
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold">Job Tracking</h2>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                {rows.length} Active Jobs
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="btn btn-sm bg-primary text-white hover:bg-primary/90 gap-2 shadow-sm shadow-primary/20"
                onClick={() => setCreateJobOpen(true)}
              >
                <span className="material-icons-outlined text-sm">add</span>
                New Job
              </button>
            </div>
          </header>

          <div className="px-8 py-4 flex flex-wrap items-center justify-between gap-4">
            <SegmentedControl
              value={view}
              size="md"
              className="bg-white p-1 shadow-sm"
              buttonClassName="rounded-md flex items-center gap-2"
              activeClassName="bg-primary text-white"
              inactiveClassName="text-slate-600 hover:bg-slate-50"
              options={[
                {
                  value: 'list',
                  label: (
                    <>
                      <span className="material-icons-outlined text-sm">list</span>
                      List View
                    </>
                  ),
                },
                {
                  value: 'calendar',
                  label: (
                    <>
                      <span className="material-icons-outlined text-sm">calendar_month</span>
                      Calendar
                    </>
                  ),
                },
              ]}
              onChange={(next) => setView(next as CalendarView)}
            />
            {view === 'calendar' ? (
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    className={`px-4 py-1.5 text-xs font-medium ${calendarMode === 'month' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-primary/5'
                      }`}
                    onClick={() => setCalendarMode('month')}
                  >
                    Month
                  </button>
                  <button
                    className={`px-4 py-1.5 text-xs font-medium ${calendarMode === 'week' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-primary/5'
                      }`}
                    onClick={() => setCalendarMode('week')}
                  >
                    Week
                  </button>
                </div>
                <CalendarNav
                  anchor={calendarAnchor}
                  mode={calendarMode}
                  onPrevious={() => setCalendarAnchor(stepCalendar(calendarAnchor, calendarMode, -1))}
                  onNext={() => setCalendarAnchor(stepCalendar(calendarAnchor, calendarMode, 1))}
                  onToday={() => setCalendarAnchor(new Date())}
                />
              </div>
            ) : null}
          </div>

          <div className="flex-1 px-8 pb-8 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
                Loading jobs...
              </div>
            ) : null}
            {hasError ? (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {(jobsQuery.error as { message?: string })?.message || 'Unable to load jobs.'}
              </div>
            ) : null}

            {view === 'calendar' ? (
              <CalendarView
                mode={calendarMode}
                anchor={calendarAnchor}
                rows={rows}
                onSelectJob={(jobId) => {
                  setSelectedJobId(jobId)
                  setView('list')
                }}
              />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
                      <SearchInput
                        className="w-full md:w-72"
                        inputClassName="bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="Search jobs, customers..."
                        value={searchTerm}
                        onChange={(value) => {
                          setSearchTerm(value)
                          setPage(1)
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <select
                          className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg"
                          value={statusFilter}
                          onChange={(event) => {
                            setStatusFilter(event.target.value)
                            setPage(1)
                          }}
                        >
                          <option value="All">All Statuses</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <select
                          className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg"
                          value={dateFilter}
                          onChange={(event) => {
                            setDateFilter(event.target.value)
                            setPage(1)
                          }}
                        >
                          <option value="30">Last 30 Days</option>
                          <option value="90">Last 90 Days</option>
                          <option value="ytd">Year to Date</option>
                          <option value="all">All Time</option>
                        </select>
                        <select
                          className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg"
                          value={sortKey}
                          onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
                        >
                          <option value="start">Sort: Start Date</option>
                          <option value="end">Sort: End Date</option>
                          <option value="customer">Sort: Customer</option>
                          <option value="status">Sort: Status</option>
                        </select>
                        <button
                          className="px-2 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
                          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                          title="Toggle sort direction"
                        >
                          <span className="material-icons-outlined text-sm">
                            {sortDirection === 'asc' ? 'north' : 'south'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold">Customer</th>
                          <th className="px-6 py-4 font-semibold">Estimate</th>
                          <th className="px-6 py-4 font-semibold">Schedule</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedRows.length === 0 ? (
                          <tr>
                            <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={5}>
                              {jobsQuery.isLoading ? 'Loading jobs...' : 'No jobs match these filters.'}
                            </td>
                          </tr>
                        ) : (
                          pagedRows.map((row) => (
                            <tr
                              key={row.id}
                              className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${row.id === selectedJobId ? 'bg-primary/5' : row.highlight ? 'bg-blue-50/20' : ''
                                }`}
                              onClick={() => setSelectedJobId(row.id)}
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-sm">{row.customer}</span>
                                  <span className="text-xs text-slate-500">{row.address}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-medium text-primary hover:underline underline-offset-4">
                                  {row.estimateId}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {formatDateRange(row.startAtUtc, row.estimatedEndAtUtc)}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {dateTimeFormatter.format(new Date(row.startAtUtc))}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <StatusPill label={row.status} tone={row.statusTone} />
                              </td>
                              <td className="px-6 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                                <JobActionMenu
                                  isOpen={openMenuId === row.id}
                                  onOpenChange={(nextOpen) => setOpenMenuId(nextOpen ? row.id : null)}
                                  onStart={() => startJobMutation.mutate(row.id)}
                                  onComplete={() => completeJobMutation.mutate(row.id)}
                                  onCancel={() => cancelJobMutation.mutate(row.id)}
                                  disableStart={row.status !== 'Scheduled'}
                                  disableComplete={row.status !== 'In Progress'}
                                  disableCancel={row.status === 'Completed' || row.status === 'Cancelled'}
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                      <span>Showing {pagedRows.length} of {filteredRows.length} jobs</span>
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1 rounded bg-primary text-white font-medium">{page}</span>
                        <button
                          className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                          onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                          disabled={page === pageCount}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedJob ? (
                    <>
                      <JobSummaryCard
                        job={selectedJob}
                        milestoneProgress={milestoneProgress}
                        milestoneTotal={milestoneTotal}
                      />
                      <ScheduleOverviewCard
                        job={selectedJob}
                        milestones={selectedJob.milestones}
                      />
                      <MilestoneManager
                        milestones={selectedJob.milestones}
                        formState={milestoneForm}
                        editingId={editingMilestoneId}
                        isSubmitting={addMilestoneMutation.isPending || updateMilestoneMutation.isPending}
                        onFormChange={setMilestoneForm}
                        onEdit={(milestone) => setMilestoneFormFromMilestone(milestone)}
                        onClearEdit={() => resetMilestoneForm()}
                        onSubmit={() => handleMilestoneSubmit(selectedJob.id)}
                        onDelete={(milestoneId) => deleteMilestoneMutation.mutate({ jobId: selectedJob.id, milestoneId })}
                        onReorder={(nextOrder) =>
                          reorderMilestonesMutation.mutate({ jobId: selectedJob.id, milestones: nextOrder })
                        }
                      />
                      <ExpenseManager
                        expenses={selectedJob.expenses}
                        formState={expenseForm}
                        editingId={editingExpenseId}
                        isSubmitting={addExpenseMutation.isPending || updateExpenseMutation.isPending}
                        onFormChange={setExpenseForm}
                        onEdit={(expense) => setExpenseFormFromExpense(expense)}
                        onClearEdit={() => resetExpenseForm()}
                        onSubmit={() => handleExpenseSubmit(selectedJob.id)}
                        onDelete={(expenseId) => deleteExpenseMutation.mutate({ jobId: selectedJob.id, expenseId })}
                      />
                    </>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-500">
                      No job details yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
        <EstimateAcceptModal
          isOpen={createJobOpen}
          mode="create"
          leads={leadsQuery.data ?? []}
          isSubmitting={createJobMutation.isPending}
          onClose={() => setCreateJobOpen(false)}
          onSubmit={(payload) => {
            if (!payload.leadId) return
            createJobMutation.mutate({
              leadId: payload.leadId,
              estimateId: null,
              description: null,
              startAtUtc: payload.startAtUtc,
              estimatedEndAtUtc: payload.estimatedEndAtUtc,
              milestones: payload.milestones,
            })
          }}
        />
      </div>
    </div>
  )
}

function mapJobRow(job: JobListResponse): JobRow {
  const statusStyle = statusStyles[job.status] ?? {
    label: job.status,
    tone: 'bg-slate-100 text-slate-600',
  }
  const addressParts = [job.addressLine1, job.city, job.state].filter(Boolean)
  const address = addressParts.length ? addressParts.join(', ') : '—'

  return {
    id: job.id,
    customer: job.leadName,
    address,
    estimateId: job.estimateId ? `#${job.estimateId.slice(0, 8)}` : '—',
    startAtUtc: job.startAtUtc,
    estimatedEndAtUtc: job.estimatedEndAtUtc,
    status: statusStyle.label,
    statusTone: statusStyle.tone,
    highlight: statusStyle.highlight,
  }
}

function computeMilestoneProgress(job: JobDetailResponse | null) {
  if (!job || job.milestones.length === 0) return 0
  const completed = job.milestones.filter((milestone) => milestone.status === MilestoneStatus.Completed).length
  return Math.round((completed / job.milestones.length) * 100)
}

function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  const local = new Date(date.getTime() - offset)
  return local.toISOString().slice(0, 16)
}

function formatDateRange(startAtUtc: string, endAtUtc: string) {
  const start = new Date(startAtUtc)
  const end = new Date(endAtUtc)
  const sameDay = start.toDateString() === end.toDateString()
  if (sameDay) return `${dayFormatter.format(start)} · ${timeRange(start, end)}`
  return `${dayFormatter.format(start)} - ${dayFormatter.format(end)}`
}

function timeRange(start: Date, end: Date) {
  const startTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(start)
  const endTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(end)
  return `${startTime} - ${endTime}`
}

function JobSummaryCard({
  job,
  milestoneProgress,
  milestoneTotal,
}: {
  job: JobDetailResponse
  milestoneProgress: number
  milestoneTotal: number
}) {
  const statusStyle = statusStyles[job.status] ?? { label: job.status, tone: 'bg-slate-100 text-slate-600' }
  const isInProgress = job.status === 'InProgress'
  const isCompleted = job.status === 'Completed'
  const isScheduled = job.status === 'Scheduled'

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 ${isCompleted ? 'bg-emerald-400' : isInProgress ? 'bg-amber-400' : 'bg-primary'}`}></div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg mb-1">{job.leadName}</h3>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="material-icons-outlined text-sm">location_on</span>
            {formatAddress(job)}
          </div>
        </div>
        <StatusPill label={statusStyle.label} tone={statusStyle.tone} className="uppercase tracking-tight" />
      </div>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Job Progression</p>
          <div className="relative flex items-center justify-between">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2"
              style={{ width: `${milestoneProgress}%` }}
            ></div>
            <ProgressStep label="Scheduled" active={isScheduled || isInProgress || isCompleted} icon="check" />
            <ProgressStep label="In Progress" active={isInProgress || isCompleted} pulse={isInProgress} />
            <ProgressStep label="Completed" active={isCompleted} icon="flag" muted={!isCompleted} />
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Milestone Completion</span>
            <span className="text-sm font-bold text-primary">{milestoneProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${milestoneProgress}%` }}></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">{milestoneTotal} milestones tracked</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <span className="material-icons-outlined text-sm">phone</span>
            Call Client
          </button>
          <button className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <span className="material-icons-outlined text-sm">email</span>
            Email Client
          </button>
        </div>
      </div>
    </div>
  )
}

function ScheduleOverviewCard({ job, milestones }: { job: JobDetailResponse; milestones: JobMilestoneResponse[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Schedule Overview</h3>
        <span className="text-xs font-semibold text-slate-500">
          {formatDateRange(job.startAtUtc, job.estimatedEndAtUtc)}
        </span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-xs font-semibold">
          Start: {dateTimeFormatter.format(new Date(job.startAtUtc))}
        </div>
        <div className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-xs font-semibold">
          End: {dateTimeFormatter.format(new Date(job.estimatedEndAtUtc))}
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Work Log</p>
        <div className="space-y-3">
          {milestones.length === 0 ? (
            <p className="text-xs text-slate-500">No milestones logged yet.</p>
          ) : (
            milestones.map((entry) => (
              <WorkLogEntry key={entry.id} milestone={entry} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function MilestoneManager({
  milestones,
  formState,
  editingId,
  isSubmitting,
  onFormChange,
  onEdit,
  onClearEdit,
  onSubmit,
  onDelete,
  onReorder,
}: {
  milestones: JobMilestoneResponse[]
  formState: MilestoneFormState
  editingId: string | null
  isSubmitting: boolean
  onFormChange: (next: MilestoneFormState) => void
  onEdit: (milestone: JobMilestoneResponse) => void
  onClearEdit: () => void
  onSubmit: () => void
  onDelete: (milestoneId: string) => void
  onReorder: (nextOrder: JobMilestoneResponse[]) => void
}) {
  const orderedMilestones = useMemo(
    () => [...milestones].sort((a, b) => a.sortOrder - b.sortOrder),
    [milestones]
  )
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDragStart = (id: string) => (event: DragEvent<HTMLDivElement>) => {
    setDraggingId(id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (id: string) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (dragOverId !== id) setDragOverId(id)
  }

  const handleDrop = (id: string) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const draggedId = draggingId ?? event.dataTransfer.getData('text/plain')
    if (!draggedId || draggedId === id) {
      setDragOverId(null)
      return
    }
    const next = reorderMilestonesById(orderedMilestones, draggedId, id)
    onReorder(next)
    setDraggingId(null)
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverId(null)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Work Milestones</h3>
        <span className="text-xs text-slate-500">{milestones.length} total</span>
      </div>
      <div className="space-y-3 mb-4">
        {orderedMilestones.length === 0 ? (
          <p className="text-xs text-slate-500">Add a milestone to start the work log.</p>
        ) : (
          orderedMilestones.map((milestone) => (
            <div key={milestone.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <div
                className={`flex-1 ${dragOverId === milestone.id ? 'rounded-lg border border-primary/40 bg-primary/5 p-2' : ''}`}
                draggable
                onDragStart={handleDragStart(milestone.id)}
                onDragOver={handleDragOver(milestone.id)}
                onDrop={handleDrop(milestone.id)}
                onDragEnd={handleDragEnd}
              >
                <p className="text-sm font-semibold">{milestone.title}</p>
                <p className="text-xs text-slate-500">
                  {dateTimeFormatter.format(new Date(milestone.occurredAtUtc))}
                </p>
                {milestone.notes ? <p className="text-xs text-slate-500 mt-1">{milestone.notes}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-slate-400 text-sm">drag_indicator</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${milestone.status === MilestoneStatus.Completed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {milestone.status === MilestoneStatus.Completed ? 'Completed' : 'Pending'}
                </span>
                <button className="text-xs text-slate-500 hover:text-primary" onClick={() => onEdit(milestone)}>
                  Edit
                </button>
                <button className="text-xs text-rose-500 hover:text-rose-600" onClick={() => onDelete(milestone.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">
            {editingId ? 'Edit Milestone' : 'Add Milestone'}
          </p>
          {editingId ? (
            <button className="text-xs text-slate-500 hover:text-slate-700" onClick={onClearEdit}>
              Cancel edit
            </button>
          ) : null}
        </div>
        <input
          className="input input-bordered w-full"
          placeholder="Milestone title"
          value={formState.title}
          onChange={(event) => onFormChange({ ...formState, title: event.target.value })}
        />
        <textarea
          className="textarea textarea-bordered w-full min-h-[80px]"
          placeholder="Notes (optional)"
          value={formState.notes}
          onChange={(event) => onFormChange({ ...formState, notes: event.target.value })}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="input input-bordered w-full"
            type="datetime-local"
            value={formState.occurredAtUtc}
            onChange={(event) => onFormChange({ ...formState, occurredAtUtc: event.target.value })}
          />
          <select
            className="select select-bordered w-full"
            value={formState.status}
            onChange={(event) => onFormChange({ ...formState, status: Number(event.target.value) as MilestoneStatus })}
          >
            <option value={MilestoneStatus.Pending}>Pending</option>
            <option value={MilestoneStatus.Completed}>Completed</option>
          </select>
        </div>
        <button
          className="btn btn-primary w-full"
          onClick={onSubmit}
          disabled={isSubmitting || !formState.title.trim()}
        >
          {isSubmitting ? 'Saving...' : editingId ? 'Update Milestone' : 'Add Milestone'}
        </button>
      </div>
    </div>
  )
}

function ExpenseManager({
  expenses,
  formState,
  editingId,
  isSubmitting,
  onFormChange,
  onEdit,
  onClearEdit,
  onSubmit,
  onDelete,
}: {
  expenses: JobExpenseResponse[]
  formState: { vendor: string; category: string; amount: string; spentAtUtc: string; notes: string; receipt: File | null }
  editingId: string | null
  isSubmitting: boolean
  onFormChange: (next: { vendor: string; category: string; amount: string; spentAtUtc: string; notes: string; receipt: File | null }) => void
  onEdit: (expense: JobExpenseResponse) => void
  onClearEdit: () => void
  onSubmit: () => void
  onDelete: (expenseId: string) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Expense Log</h3>
        <span className="text-xs text-slate-500">{expenses.length} receipts</span>
      </div>
      <div className="space-y-3 mb-4">
        {expenses.length === 0 ? (
          <p className="text-xs text-slate-500">No expenses logged yet.</p>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <div>
                <p className="text-sm font-semibold">{expense.vendor}</p>
                <p className="text-xs text-slate-500">
                  {expense.category ? `${expense.category} · ` : ''}{dateTimeFormatter.format(new Date(expense.spentAtUtc))}
                </p>
                {expense.notes ? <p className="text-xs text-slate-500 mt-1">{expense.notes}</p> : null}
                {expense.receiptUrl ? (
                  <a
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                    href={expense.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="material-icons-outlined text-xs">receipt</span>
                    View receipt
                  </a>
                ) : null}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-semibold">{formatCurrency(expense.amount)}</span>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-slate-500 hover:text-primary" onClick={() => onEdit(expense)}>
                    Edit
                  </button>
                  <button className="text-xs text-rose-500 hover:text-rose-600" onClick={() => onDelete(expense.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">
            {editingId ? 'Edit Expense' : 'Add Expense'}
          </p>
          {editingId ? (
            <button className="text-xs text-slate-500 hover:text-slate-700" onClick={onClearEdit}>
              Cancel edit
            </button>
          ) : null}
        </div>
        <input
          className="input input-bordered w-full"
          placeholder="Vendor name"
          value={formState.vendor}
          onChange={(event) => onFormChange({ ...formState, vendor: event.target.value })}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="input input-bordered w-full"
            placeholder="Category"
            value={formState.category}
            onChange={(event) => onFormChange({ ...formState, category: event.target.value })}
          />
          <input
            className="input input-bordered w-full"
            placeholder="Amount"
            inputMode="decimal"
            value={formState.amount}
            onChange={(event) => onFormChange({ ...formState, amount: event.target.value })}
          />
        </div>
        <input
          className="input input-bordered w-full"
          type="datetime-local"
          value={formState.spentAtUtc}
          onChange={(event) => onFormChange({ ...formState, spentAtUtc: event.target.value })}
        />
        <textarea
          className="textarea textarea-bordered w-full min-h-[80px]"
          placeholder="Notes (optional)"
          value={formState.notes}
          onChange={(event) => onFormChange({ ...formState, notes: event.target.value })}
        />
        <input
          className="file-input file-input-bordered w-full"
          type="file"
          accept="image/*,application/pdf"
          onChange={(event) =>
            onFormChange({
              ...formState,
              receipt: event.target.files && event.target.files.length > 0 ? event.target.files[0] : null,
            })
          }
        />
        <button
          className="btn btn-primary w-full"
          onClick={onSubmit}
          disabled={isSubmitting || !formState.vendor.trim() || !formState.amount}
        >
          {isSubmitting ? 'Saving...' : editingId ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </div>
  )
}

function JobActionMenu({
  isOpen,
  onOpenChange,
  onStart,
  onComplete,
  onCancel,
  disableStart,
  disableComplete,
  disableCancel,
}: {
  isOpen: boolean
  onOpenChange: (nextOpen: boolean) => void
  onStart: () => void
  onComplete: () => void
  onCancel: () => void
  disableStart?: boolean
  disableComplete?: boolean
  disableCancel?: boolean
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-job-menu]')) {
        onOpenChange(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onOpenChange])

  return (
    <div className="relative z-50" data-job-menu>
      <button
        className="btn btn-ghost btn-sm"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => onOpenChange(!isOpen)}
      >
        <span className="material-icons-outlined">more_vert</span>
      </button>
      {isOpen ? (
        <ul className="menu absolute right-0 mt-2 z-50 w-44 rounded-box border border-slate-200 bg-white p-2 shadow">
          <li>
            <button
              type="button"
              onClick={() => {
                onStart()
                onOpenChange(false)
              }}
              disabled={disableStart}
            >
              <span className="material-icons-outlined text-base">play_arrow</span>
              Start job
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onComplete()
                onOpenChange(false)
              }}
              disabled={disableComplete}
            >
              <span className="material-icons-outlined text-base">check_circle</span>
              Complete job
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onCancel()
                onOpenChange(false)
              }}
              disabled={disableCancel}
              className="text-rose-600"
            >
              <span className="material-icons-outlined text-base">cancel</span>
              Cancel job
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

function ProgressStep({
  label,
  icon,
  active,
  pulse,
  muted,
}: {
  label: string
  icon?: string
  active?: boolean
  pulse?: boolean
  muted?: boolean
}) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${muted ? 'bg-slate-100 text-slate-400' : active ? 'bg-primary text-white' : 'bg-slate-100'
          }`}
      >
        {pulse ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> : null}
        {icon ? <span className="material-icons-outlined text-sm">{icon}</span> : null}
      </div>
      <span
        className={`text-[10px] font-bold uppercase ${muted ? 'text-slate-400' : active ? 'text-primary' : 'text-slate-600'
          }`}
      >
        {label}
      </span>
    </div>
  )
}

function WorkLogEntry({ milestone }: { milestone: JobMilestoneResponse }) {
  return (
    <div className="flex gap-3">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${milestone.status === MilestoneStatus.Completed ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'
          }`}
      >
        <span className="material-icons-outlined text-sm">
          {milestone.status === MilestoneStatus.Completed ? 'check_circle' : 'pending_actions'}
        </span>
      </div>
      <div>
        <p className="text-xs text-slate-500">{dateTimeFormatter.format(new Date(milestone.occurredAtUtc))}</p>
        <p className="text-sm font-medium">{milestone.title}</p>
        {milestone.notes ? <p className="text-xs text-slate-500">{milestone.notes}</p> : null}
      </div>
    </div>
  )
}

function formatAddress(job: JobDetailResponse) {
  const parts = [job.addressLine1, job.addressLine2, job.city, job.state, job.postalCode]
  return parts.filter(Boolean).join(', ') || 'No address on file.'
}

function CalendarNav({
  anchor,
  mode,
  onPrevious,
  onNext,
  onToday,
}: {
  anchor: Date
  mode: CalendarMode
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}) {
  const label =
    mode === 'month'
      ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(anchor)
      : `Week of ${dayFormatter.format(startOfWeek(anchor))}`

  return (
    <div className="flex items-center gap-2">
      <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50" onClick={onToday}>
        Today
      </button>
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5">
        <button className="p-1 hover:bg-slate-100 rounded" onClick={onPrevious}>
          <span className="material-icons-outlined text-sm">chevron_left</span>
        </button>
        <span className="text-xs font-semibold text-slate-600 min-w-[120px] text-center">{label}</span>
        <button className="p-1 hover:bg-slate-100 rounded" onClick={onNext}>
          <span className="material-icons-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  )
}

function CalendarView({
  mode,
  anchor,
  rows,
  onSelectJob,
}: {
  mode: CalendarMode
  anchor: Date
  rows: JobRow[]
  onSelectJob: (jobId: string) => void
}) {
  if (mode === 'week') {
    const weekStart = startOfWeek(anchor)
    const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="grid grid-cols-7 gap-3 text-xs text-slate-500 uppercase font-semibold">
          {days.map((day) => (
            <div key={day.toISOString()} className="text-center">
              {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(day)}
              <div className="text-sm text-slate-700 font-bold mt-1">{day.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3 mt-4">
          {days.map((day) => (
            <div key={day.toISOString()} className="min-h-[120px] border border-slate-100 rounded-lg p-2">
              {rows
                .filter((row) => isWithinRange(day, row.startAtUtc, row.estimatedEndAtUtc))
                .map((row) => (
                  <button
                    key={row.id}
                    className="w-full text-left text-xs font-semibold bg-primary/10 text-primary rounded-md px-2 py-1 mb-1"
                    onClick={() => onSelectJob(row.id)}
                  >
                    {row.customer}
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = addDays(startOfWeek(addDays(monthEnd, 7)), 6)

  const days = [] as Date[]
  let current = gridStart
  while (current <= gridEnd) {
    days.push(current)
    current = addDays(current, 1)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="grid grid-cols-7 gap-3 text-xs text-slate-500 uppercase font-semibold">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
          <div key={label} className="text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-3 mt-4">
        {days.map((day) => {
          const isCurrentMonth = day.getMonth() === anchor.getMonth()
          const jobsForDay = rows.filter((row) => isWithinRange(day, row.startAtUtc, row.estimatedEndAtUtc))
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] border rounded-lg p-2 ${isCurrentMonth ? 'border-slate-200' : 'border-slate-100 text-slate-400'
                }`}
            >
              <div className="text-xs font-semibold text-right mb-2">{day.getDate()}</div>
              {jobsForDay.slice(0, 3).map((row) => (
                <button
                  key={row.id}
                  className="w-full text-left text-xs font-semibold bg-primary/10 text-primary rounded-md px-2 py-1 mb-1"
                  onClick={() => onSelectJob(row.id)}
                >
                  {row.customer}
                </button>
              ))}
              {jobsForDay.length > 3 ? (
                <div className="text-[10px] text-slate-500">+{jobsForDay.length - 3} more</div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function startOfWeek(date: Date) {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(date)
  start.setDate(date.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(date.getDate() + days)
  return next
}

function isWithinRange(day: Date, startAtUtc: string, endAtUtc: string) {
  const start = new Date(startAtUtc)
  const end = new Date(endAtUtc)
  const target = new Date(day)
  target.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return target >= start && target <= end
}

function stepCalendar(date: Date, mode: CalendarMode, direction: number) {
  const next = new Date(date)
  if (mode === 'week') {
    next.setDate(next.getDate() + direction * 7)
  } else {
    next.setMonth(next.getMonth() + direction)
  }
  return next
}

function reorderMilestonesById(items: JobMilestoneResponse[], draggedId: string, targetId: string) {
  const draggedIndex = items.findIndex((item) => item.id === draggedId)
  const targetIndex = items.findIndex((item) => item.id === targetId)
  if (draggedIndex === -1 || targetIndex === -1) return items
  const next = [...items]
  const [dragged] = next.splice(draggedIndex, 1)
  next.splice(targetIndex, 0, dragged)
  return next.map((item, index) => ({ ...item, sortOrder: index + 1 }))
}
