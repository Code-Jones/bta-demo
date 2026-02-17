import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { AppSidebar } from '../../components/AppSidebar'
import { pipelineBoardQueryOptions } from '../../api/pipeline'
import { queryKeys } from '../../api/queryKeys'
import { LeadCreateModal } from '../../components/modals/LeadCreateModal'
import { EstimateUpsertModal } from '../../components/modals/EstimateUpsertModal'
import { EstimateAcceptModal } from '../../components/modals/EstimateAcceptModal'
import { leadsQueryOptions } from '../../api/leads'
import { companiesQueryOptions } from '../../api/companies'
import { SearchInput } from '../../components/SearchInput'
import { FilterSelect } from '../../components/FilterSelect'
import { StatusPill } from '../../components/StatusPill'
import { InitialsAvatar } from '../../components/InitialsAvatar'
import { formatCurrency } from '../../utils'
import { titleStyles, boardColumnDefinitions, rejectedTimerWindowMs } from './config'
import { estimatesQueryOptions } from '../../api'
import {
  useCreateEstimateMutation,
  useSendEstimateMutation,
  useRejectEstimateMutation,
  useAcceptEstimateMutation,
  useStartJobMutation,
  useCompleteJobMutation,
  useUpdateLeadMutation,
} from './mutations'

type PipelineCardItem = {
  id: string
  entityType: string
  columnKey: string
  boardColumnKey: string
  tag: string
  tagTone: string
  name: string
  meta: string
  value: string
  initials?: string
  avatarUrl?: string
  highlightValue?: boolean
  valueTone?: string
  muted?: boolean
  statusAtUtc?: string | null
  timerLabel?: string | null
  timerTone?: string
}

type PipelineColumn = {
  key: string
  title: string
  total: string | null
  totalValue: number
  highlight?: boolean
  count: number
  items: PipelineCardItem[]
}

type DragItemData = {
  item: PipelineCardItem
}

type DropAction = 'convert' | 'lost' | 'accept' | 'reject'

type DropTargetData = {
  columnKey?: string
  action?: DropAction
}


const getRejectedTimerLabel = (statusAtUtc: string | null | undefined, now: number) => {
  if (!statusAtUtc) return '24h timer'
  const statusTime = new Date(statusAtUtc).getTime()
  if (Number.isNaN(statusTime)) return '24h timer'
  const msRemaining = statusTime + rejectedTimerWindowMs - now
  if (msRemaining <= 0) return '24h elapsed'
  const hours = Math.floor(msRemaining / (60 * 60 * 1000))
  const minutes = Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000))
  return `Expires in ${hours}h ${minutes}m`
}

const formatDuration = (ms: number) => {
  const totalMinutes = Math.max(0, Math.floor(ms / (60 * 1000)))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h ${minutes}m`
}

const getScheduledTimerLabel = (startAtUtc: string | null | undefined, now: number) => {
  if (!startAtUtc) return 'Start time TBD'
  const startTime = new Date(startAtUtc).getTime()
  if (Number.isNaN(startTime)) return 'Start time TBD'
  const msRemaining = startTime - now
  if (Math.abs(msRemaining) < 60 * 1000) return 'Starting now'
  if (msRemaining < 0) return `Start overdue by ${formatDuration(Math.abs(msRemaining))}`
  return `Starts in ${formatDuration(msRemaining)}`
}

const normalizeFilterValue = (value: string) => {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed || trimmed.startsWith('all ')) return null
  return trimmed
}

export function PipelinePage() {
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false)
  const [editLeadId, setEditLeadId] = useState<string | null>(null)
  const [estimateCreate, setEstimateCreate] = useState<{ leadId: string; leadName: string } | null>(null)
  const [estimateAccept, setEstimateAccept] = useState<
    {
      estimateId: string
      leadName: string
      needsSend?: boolean
      milestoneTemplates?: { title: string }[]
    } | null
  >(null)
  const [tradeTypeFilter, setTradeTypeFilter] = useState('All Trade Types')
  const [companyFilter, setCompanyFilter] = useState('All Companies')
  const [dragError, setDragError] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<PipelineCardItem | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const boardQuery = useQuery(pipelineBoardQueryOptions())
  const estimatesQuery = useQuery(estimatesQueryOptions())
  const leadsQuery = useQuery(leadsQueryOptions())
  const companiesQuery = useQuery(companiesQueryOptions())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const refreshPipeline = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenue() })
    queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(false) })
    queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(true) })
    queryClient.invalidateQueries({ queryKey: queryKeys.companies.list(false) })
    queryClient.invalidateQueries({ queryKey: queryKeys.estimates.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.list() })
    setDragError(null)
  }

  const handleMutationError = (error: unknown) => {
    const apiError = error as { message?: string }
    setDragError(apiError?.message || 'Unable to update pipeline item. Try again.')
  }

  const createEstimateMutation = useCreateEstimateMutation(refreshPipeline, handleMutationError, setEstimateCreate)
  const sendEstimateMutation = useSendEstimateMutation(refreshPipeline, handleMutationError)
  const rejectEstimateMutation = useRejectEstimateMutation(refreshPipeline, handleMutationError)
  const acceptEstimateMutation = useAcceptEstimateMutation(refreshPipeline, handleMutationError, setEstimateAccept)
  const startJobMutation = useStartJobMutation(refreshPipeline, handleMutationError)
  const completeJobMutation = useCompleteJobMutation(refreshPipeline, handleMutationError)
  const updateLeadMutation = useUpdateLeadMutation(refreshPipeline, handleMutationError)


  const filteredSourceData = useMemo(() => {
    const map = new Map<string, { count: number; totalValue: number; items: PipelineCardItem[] }>()
    if (!boardQuery.data) return map
    const term = searchTerm.trim().toLowerCase()
    const tradeFilter = normalizeFilterValue(tradeTypeFilter)
    const companyFilterNormalized = normalizeFilterValue(companyFilter)

    const matchesSearch = (value: string) => value.toLowerCase().includes(term)
    const matchesFilterValue = (value: string, filterValue: string | null) =>
      !filterValue || value.toLowerCase().includes(filterValue)

    boardQuery.data.columns.forEach((column) => {
      const style = titleStyles[column.key] ?? { tag: 'Update', tone: 'bg-slate-100 text-slate-600' }
      const boardColumnKey =
        boardColumnDefinitions.find((board) => board.sourceKeys.includes(column.key))?.key ?? column.key
      const filteredItems = column.items.filter((item) => {
        const name = item.title ?? ''
        const meta = item.subtitle ?? ''
        const status = item.status ?? ''
        const combined = `${name} ${meta} ${status}`

        if (term && ![name, meta, status].some((value) => value && matchesSearch(value))) return false
        if (!matchesFilterValue(combined, tradeFilter)) return false
        if (!matchesFilterValue(combined, companyFilterNormalized)) return false
        return true
      })

      const items = filteredItems.map((item) => {
        const timerLabel =
          boardColumnKey === 'rejected'
            ? getRejectedTimerLabel(item.statusAtUtc ?? null, now)
            : boardColumnKey === 'scheduled'
              ? getScheduledTimerLabel(item.statusAtUtc ?? null, now)
              : null
        const timerTone =
          boardColumnKey === 'rejected'
            ? 'bg-rose-50 text-rose-600'
            : boardColumnKey === 'scheduled'
              ? 'bg-amber-50 text-amber-700'
              : undefined
        return {
          id: item.id,
          entityType: item.entityType,
          columnKey: column.key,
          boardColumnKey,
          tag: style.tag,
          tagTone: style.tone,
          name: item.title,
          meta: item.subtitle,
          value: item.amount ? formatCurrency(item.amount) : '--',
          muted: style.muted,
          statusAtUtc: item.statusAtUtc ?? null,
          timerLabel,
          timerTone,
        }
      })

      const totalValue = filteredItems.reduce((sum, item) => sum + (item.amount ?? 0), 0)
      map.set(column.key, { count: filteredItems.length, totalValue, items })
    })

    return map
  }, [boardQuery.data, now, searchTerm, tradeTypeFilter, companyFilter])

  const columns = useMemo<PipelineColumn[]>(() => {
    if (!boardQuery.data) return []
    return boardColumnDefinitions.map((boardColumn) => {
      const items = boardColumn.sourceKeys.flatMap((sourceKey) => filteredSourceData.get(sourceKey)?.items ?? [])
      const count = boardColumn.sourceKeys.reduce(
        (sum, sourceKey) => sum + (filteredSourceData.get(sourceKey)?.count ?? 0),
        0,
      )
      const totalValue = boardColumn.sourceKeys.reduce(
        (sum, sourceKey) => sum + (filteredSourceData.get(sourceKey)?.totalValue ?? 0),
        0,
      )
      const highlight = boardColumn.sourceKeys.some(
        (sourceKey) => (filteredSourceData.get(sourceKey)?.count ?? 0) > 0 && titleStyles[sourceKey]?.highlight,
      )

      return {
        key: boardColumn.key,
        title: boardColumn.title,
        total: totalValue > 0 ? formatCurrency(totalValue) : null,
        totalValue,
        highlight,
        count,
        items,
      }
    })
  }, [boardQuery.data, filteredSourceData])

  const hasSearch = searchTerm.trim().length > 0
  const pipelineTotalFiltered = useMemo(() => {
    let total = 0
    filteredSourceData.forEach((column) => {
      total += column.totalValue
    })
    return total
  }, [filteredSourceData])
  const pipelineTotal = hasSearch ? pipelineTotalFiltered : boardQuery.data?.pipelineTotal ?? 0
  const columnMap = useMemo(() => {
    const map = new Map<string, { count: number; totalValue: number }>()
    filteredSourceData.forEach((column, key) => {
      map.set(key, { count: column.count, totalValue: column.totalValue })
    })
    return map
  }, [filteredSourceData])

  const companyOptions = useMemo(() => {
    const names = (companiesQuery.data ?? [])
      .map((company) => company.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
    return ['All Companies', ...names]
  }, [companiesQuery.data])

  const getCount = (key: string) => columnMap.get(key)?.count ?? 0
  const getTotal = (key: string) => columnMap.get(key)?.totalValue ?? 0

  const jobsScheduledCount = getCount('jobsScheduled')
  const jobsInProgressCount = getCount('jobsInProgress')
  const jobsCompletedCount = getCount('jobsCompleted')
  const jobsCountTotal = jobsScheduledCount + jobsInProgressCount + jobsCompletedCount
  const jobsValueTotal = getTotal('jobsScheduled') + getTotal('jobsInProgress') + getTotal('jobsCompleted')
  const averageJobValue = jobsCountTotal > 0 ? jobsValueTotal / jobsCountTotal : 0
  const completionRate = jobsCountTotal > 0 ? Math.round((jobsCompletedCount / jobsCountTotal) * 100) : null

  const estimatesAwaitingCount = getCount('estimatesSent')
  const revenuePending = getTotal('jobsScheduled') + getTotal('jobsInProgress')

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragItemData | undefined
    const item = data?.item
    setDragError(null)
    if (item) setActiveItem(item)
  }

  const handleDragCancel = () => {
    setActiveItem(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const activeData = event.active.data.current as DragItemData | undefined
    const overData = event.over?.data.current as DropTargetData | undefined
    const targetColumnKey = overData?.columnKey
    const dropAction = overData?.action
    if (!activeData?.item || !targetColumnKey) {
      setActiveItem(null)
      return
    }

    const item = activeData.item
    if (item.boardColumnKey === targetColumnKey && !dropAction) {
      setActiveItem(null)
      return
    }

    setDragError(null)

    try {
      if (item.entityType === 'lead') {
        if (targetColumnKey === 'estimates' && dropAction === 'convert') {
          setEstimateCreate({ leadId: item.id, leadName: item.name })
        } else if (targetColumnKey === 'estimates' && dropAction === 'lost') {
          await updateLeadMutation.mutateAsync({ id: item.id, status: 'Lost' })
        } else if (item.columnKey === 'leadsLost' && targetColumnKey === 'leads') {
          await updateLeadMutation.mutateAsync({ id: item.id, status: 'New' })
        }
      }

      if (item.entityType === 'estimate') {
        if (targetColumnKey === 'scheduled' && dropAction === 'accept') {
          const estimateDetail = estimatesQuery.data?.find((estimate) => estimate.id === item.id)
          const milestoneTemplates = estimateDetail?.lineItems
            ?.filter((line) => !line.isTaxLine)
            .map((line) => ({ title: line.description }))
          setEstimateAccept({
            estimateId: item.id,
            leadName: item.name,
            needsSend: item.columnKey === 'estimatesDraft',
            milestoneTemplates,
          })
        } else if (targetColumnKey === 'scheduled' && dropAction === 'reject') {
          await rejectEstimateMutation.mutateAsync(item.id)
        }
      }

      if (item.entityType === 'job') {
        if (item.columnKey === 'jobsScheduled' && targetColumnKey === 'inProgress') {
          await startJobMutation.mutateAsync(item.id)
        } else if (item.columnKey === 'jobsInProgress' && targetColumnKey === 'completed') {
          await completeJobMutation.mutateAsync(item.id)
        }
      }
    } catch (error) {
      const apiError = error as { message?: string }
      setDragError(apiError?.message || 'Unable to update pipeline item. Try again.')
    } finally {
      setActiveItem(null)
    }
  }

  return (
    <div className="bg-background-light text-slate-900">
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Operations &amp; Job Pipeline</h1>
              <p className="text-sm text-slate-500">Track workflow from lead to completion</p>
            </div>
            <div className="flex items-center gap-4">
              <SearchInput
                className="w-64"
                inputClassName="bg-slate-100 border-transparent focus:ring-2 focus:ring-primary"
                placeholder="Search jobs or customers..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
              <div className="h-8 w-px bg-slate-200 mx-2" />
              <button className="btn btn-sm bg-primary text-white hover:bg-primary/90 gap-2 shadow-sm">
                Settings
                <span className="material-icons text-sm">settings</span>
              </button>
            </div>
          </header>

          <section className="bg-white border-b border-slate-200 px-8 py-3 flex items-center gap-6">
            <div className="flex items-center gap-4">
              <FilterSelect
                label="Trade Type"
                options={['All Trade Types', 'HVAC', 'Electrical', 'Plumbing', 'Roofing']}
                value={tradeTypeFilter}
                onChange={setTradeTypeFilter}
              />
              <FilterSelect
                label="Company"
                options={companyOptions}
                value={companyFilter}
                onChange={setCompanyFilter}
              />
            </div>
            <div className="ml-auto flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-slate-400">Pipeline Total</p>
                <p className="text-sm font-bold text-slate-900">
                  {pipelineTotal > 0 ? formatCurrency(pipelineTotal) : '$0'}
                </p>
              </div>
            </div>
          </section>

          <div className="flex-1 overflow-x-auto custom-scrollbar bg-slate-50 p-6">
            {boardQuery.isLoading ? (
              <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
                Loading pipeline board...
              </div>
            ) : null}
            {boardQuery.isError ? (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {boardQuery.error?.message || 'Unable to load pipeline data.'}
              </div>
            ) : null}
            {dragError ? (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {dragError}
              </div>
            ) : null}
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="board-container flex gap-4 h-full">
                {columns.length === 0 && !boardQuery.isLoading && !boardQuery.isError ? (
                  <div className="w-full rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    No pipeline activity yet.
                  </div>
                ) : null}
                {columns.map((column) => {
                  const showLeadSplit = activeItem?.entityType === 'lead' && column.key === 'estimates'
                  const showEstimateSplit = activeItem?.entityType === 'estimate' && column.key === 'scheduled'
                  const showSplitOverlay = showLeadSplit || showEstimateSplit

                  return (
                    <DroppableColumn key={column.key} column={column} isDropDisabled={showSplitOverlay}>
                      <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-700">{column.title}</h3>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.highlight
                              ? 'bg-primary text-white'
                              : 'bg-slate-200 text-slate-600'
                              }`}
                          >
                            {column.count}
                          </span>
                        </div>
                        {column.total ? (
                          <span className="text-xs font-semibold text-slate-400">{column.total}</span>
                        ) : (
                          <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                            <span className="material-icons text-lg text-slate-400">more_horiz</span>
                          </button>
                        )}
                      </div>
                      <div className="relative space-y-3 min-h-[140px]">
                        {showLeadSplit ? (
                          <SplitDropOverlay
                            columnKey={column.key}
                            top={{
                              action: 'convert',
                              label: 'Convert to estimate',
                              toneClass: 'bg-emerald-50/90 border-emerald-200 text-emerald-700',
                              activeClass: 'ring-2 ring-emerald-400/60',
                            }}
                            bottom={{
                              action: 'lost',
                              label: 'Lost',
                              toneClass: 'bg-rose-50/90 border-rose-200 text-rose-700',
                              activeClass: 'ring-2 ring-rose-400/60',
                            }}
                          />
                        ) : null}
                        {showEstimateSplit ? (
                          <SplitDropOverlay
                            columnKey={column.key}
                            top={{
                              action: 'accept',
                              label: 'Accepted',
                              toneClass: 'bg-emerald-50/90 border-emerald-200 text-emerald-700',
                              activeClass: 'ring-2 ring-emerald-400/60',
                            }}
                            bottom={{
                              action: 'reject',
                              label: 'Rejected',
                              toneClass: 'bg-rose-50/90 border-rose-200 text-rose-700',
                              activeClass: 'ring-2 ring-rose-400/60',
                            }}
                          />
                        ) : null}
                        {column.key === 'leads' ? (
                          <button
                            className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white transition-all text-sm font-medium flex items-center justify-center gap-2"
                            onClick={() => setIsCreateLeadOpen(true)}
                          >
                            <span className="material-icons text-sm">add</span>
                            Add New Lead
                          </button>
                        ) : null}
                        {column.items.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-slate-200 bg-white/60 p-3 text-xs text-slate-400 text-center">
                            No items yet
                          </div>
                        ) : (
                          column.items.map((item) => (
                            <DraggableCard
                              key={`${item.entityType}-${item.id}`}
                              item={item}
                              onClick={() => {
                                if (item.entityType === 'lead') {
                                  setEditLeadId(item.id)
                                }
                              }}
                            />
                          ))
                        )}
                      </div>
                    </DroppableColumn>
                  )
                })}
              </div>
              <DragOverlay>
                {activeItem ? <PipelineCard {...activeItem} /> : null}
              </DragOverlay>
            </DndContext>
          </div>

          <footer className="bg-white border-t border-slate-200 px-8 py-3 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-6">
              <FooterBadge dotClass="bg-orange-500" label={`${jobsInProgressCount} Jobs In Progress`} />
              <FooterBadge dotClass="bg-blue-500" label={`${estimatesAwaitingCount} Estimates Awaiting`} />
              <FooterBadge
                dotClass="bg-emerald-500"
                label={`${revenuePending > 0 ? formatCurrency(revenuePending) : '$0'} Revenue Pending Completion`}
              />
            </div>
            <div className="flex items-center gap-4 font-medium">
              <span className="text-slate-400">
                Average Job Value:{' '}
                <span className="text-slate-900">
                  {averageJobValue > 0 ? formatCurrency(averageJobValue) : '$0'}
                </span>
              </span>
              <span>•</span>
              <span className="text-slate-400">
                Completion Rate (MoM):{' '}
                <span className="text-slate-500">{completionRate === null ? '--' : `${completionRate}%`}</span>
              </span>
            </div>
          </footer>
        </main>
      </div>
      <LeadCreateModal isOpen={isCreateLeadOpen} onClose={() => setIsCreateLeadOpen(false)} />
      <LeadCreateModal
        isOpen={Boolean(editLeadId)}
        onClose={() => setEditLeadId(null)}
        leadId={editLeadId ?? undefined}
      />
      <EstimateUpsertModal
        isOpen={Boolean(estimateCreate)}
        mode="create"
        leads={leadsQuery.data ?? []}
        leadId={estimateCreate?.leadId}
        leadName={estimateCreate?.leadName}
        isSubmitting={createEstimateMutation.isPending}
        onClose={() => setEstimateCreate(null)}
        onSubmit={(payload) => {
          if (!estimateCreate) return
          createEstimateMutation.mutate({
            leadId: payload.leadId,
            amount: payload.amount,
            description: payload.description,
            lineItems: payload.lineItems,
          })
        }}
      />
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
            handleMutationError(error)
          }
        }}
      />
    </div>
  )
}

function DroppableColumn({
  column,
  children,
  isDropDisabled,
}: {
  column: PipelineColumn
  children: ReactNode
  isDropDisabled?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.key,
    data: { columnKey: column.key },
    disabled: isDropDisabled,
  })

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column flex flex-col ${isOver ? 'ring-2 ring-primary/20 bg-white/60 rounded-xl' : ''}`}
    >
      {children}
    </div>
  )
}

type SplitDropOption = {
  action: DropAction
  label: string
  toneClass: string
  activeClass: string
}

function SplitDropOverlay({
  columnKey,
  top,
  bottom,
}: {
  columnKey: string
  top: SplitDropOption
  bottom: SplitDropOption
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col gap-2 rounded-xl bg-white/70 p-3 backdrop-blur-[1px]">
      <SplitDropZone columnKey={columnKey} {...top} />
      <SplitDropZone columnKey={columnKey} {...bottom} />
    </div>
  )
}

function SplitDropZone({
  columnKey,
  action,
  label,
  toneClass,
  activeClass,
}: {
  columnKey: string
  action: DropAction
  label: string
  toneClass: string
  activeClass: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `split-${columnKey}-${action}`,
    data: { columnKey, action },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 rounded-lg border border-dashed px-3 py-4 flex items-center justify-center text-xs font-semibold uppercase tracking-wide ${toneClass} ${isOver ? activeClass : ''
        }`}
    >
      {label}
    </div>
  )
}

function DraggableCard({ item, onClick }: { item: PipelineCardItem; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${item.entityType}-${item.id}`,
    data: { item },
  })
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-70' : ''}
      onClick={() => {
        if (!isDragging) onClick?.()
      }}
    >
      <PipelineCard {...item} />
    </div>
  )
}

function PipelineCard({
  tag,
  tagTone,
  name,
  meta,
  value,
  avatarUrl,
  highlightValue,
  valueTone,
  muted,
  timerLabel,
  timerTone,
}: PipelineCardItem) {
  return (
    <div
      className={`bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${muted ? 'opacity-75 hover:opacity-100' : ''
        } ${highlightValue ? 'border-l-4 border-l-primary/60' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <StatusPill
          label={tag}
          tone={tagTone}
          className="text-[10px] font-bold uppercase tracking-tight"
        />
      </div>
      <h4 className="font-bold text-slate-900 text-base mb-1">{name}</h4>
      <p className="text-sm text-slate-500 mb-2">{meta}</p>
      {timerLabel ? (
        <div
          className={`mb-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${timerTone ?? 'bg-rose-50 text-rose-600'
            }`}
        >
          <span className="material-icons text-[12px]">timer</span>
          {timerLabel}
        </div>
      ) : null}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <span className={`text-sm font-bold ${valueTone ?? highlightValue ? 'text-primary' : 'text-slate-700'}`}>
          {value}
        </span>
        {avatarUrl ? (
          <img alt={name} className="w-6 h-6 rounded-full" src={avatarUrl} />
        ) : (
          <InitialsAvatar
            name={name}
            size="sm"
            className="w-6 h-6 text-[10px]"
            toneClassName="bg-slate-100 text-slate-600"
          />
        )}
      </div>
    </div>
  )
}

function FooterBadge({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${dotClass}`} />
      <span>{label}</span>
    </div>
  )
}
