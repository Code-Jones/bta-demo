import { useEffect, useRef, useState } from 'react'
import type { DragEvent, FormEvent } from 'react'
import type { LeadResponse } from '../../api'
import { MilestoneStatus } from '../../api'

type MilestoneDraft = {
  id: string
  title: string
}

type EstimateAcceptModalProps = {
  isOpen: boolean
  mode?: 'accept' | 'create'
  leadName?: string
  leadId?: string
  leads?: LeadResponse[]
  milestoneTemplates?: { title: string }[]
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: {
    leadId?: string
    startAtUtc: string
    estimatedEndAtUtc: string
    milestones: { title: string; status: MilestoneStatus; sortOrder: number }[]
  }) => void
}

function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  const local = new Date(date.getTime() - offset)
  return local.toISOString().slice(0, 16)
}

export function EstimateAcceptModal({
  isOpen,
  mode = 'accept',
  leadName,
  leadId,
  leads,
  milestoneTemplates,
  isSubmitting,
  onClose,
  onSubmit,
}: EstimateAcceptModalProps) {
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [startAtUtc, setStartAtUtc] = useState('')
  const [estimatedEndAtUtc, setEstimatedEndAtUtc] = useState('')
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const dialog = modalRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
      queueMicrotask(() => {
        const start = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
        setStartAtUtc(toLocalInputValue(start))
        setEstimatedEndAtUtc(toLocalInputValue(end))
        setTouched(false)
        const templateRows = milestoneTemplates && milestoneTemplates.length > 0
          ? milestoneTemplates.map((item) => ({ id: createId(), title: item.title }))
          : [createBlankMilestone()]
        setMilestones(templateRows)
        setDraggingId(null)
        setDragOverId(null)
        setSelectedLeadId(leadId ?? '')
      })
    } else if (dialog.open) {
      dialog.close()
    }
  }, [isOpen, milestoneTemplates, leadId, mode])

  const handleClose = () => {
    modalRef.current?.close()
    onClose()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (!startAtUtc || !estimatedEndAtUtc) return
    if (mode === 'create' && !selectedLeadId) return
    const start = new Date(startAtUtc)
    const end = new Date(estimatedEndAtUtc)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return
    if (end <= start) return
    const payloadMilestones = milestones
      .map((item, index) => ({
        title: item.title.trim(),
        status: MilestoneStatus.Pending,
        sortOrder: index + 1,
      }))
      .filter((item) => item.title)
    onSubmit({
      leadId: mode === 'create' ? selectedLeadId : undefined,
      startAtUtc: start.toISOString(),
      estimatedEndAtUtc: end.toISOString(),
      milestones: payloadMilestones,
    })
  }

  const startTime = startAtUtc ? new Date(startAtUtc).getTime() : null
  const endTime = estimatedEndAtUtc ? new Date(estimatedEndAtUtc).getTime() : null
  const hasRangeError =
    Boolean(startTime && endTime && !Number.isNaN(startTime) && !Number.isNaN(endTime) && endTime <= startTime)

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
    setMilestones((prev) => reorderMilestones(prev, draggedId, id))
    setDraggingId(null)
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverId(null)
  }

  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-lg p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">{mode === 'create' ? 'Create Job' : 'Accept Estimate'}</h3>
            <p className="text-xs text-slate-500">
              {mode === 'create'
                ? 'Create a job with schedule and milestones.'
                : leadName
                  ? `Confirm the job schedule for ${leadName}.`
                  : 'Confirm the job schedule for this estimate.'}
            </p>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose} type="button">
            <span className="material-icons text-slate-500">close</span>
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          {mode === 'create' ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Lead</label>
              <select
                className="select select-bordered w-full"
                value={selectedLeadId}
                onChange={(event) => setSelectedLeadId(event.target.value)}
              >
                <option value="">Select a lead</option>
                {(leads ?? []).map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} {lead.company ? `· ${lead.company}` : ''}
                  </option>
                ))}
              </select>
              {touched && !selectedLeadId ? (
                <p className="text-xs text-rose-600">Select a lead for this job.</p>
              ) : null}
            </div>
          ) : null}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Scheduled Start</label>
            <input
              className="input input-bordered w-full"
              type="datetime-local"
              value={startAtUtc}
              onChange={(event) => setStartAtUtc(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Estimated End</label>
            <input
              className="input input-bordered w-full"
              type="datetime-local"
              value={estimatedEndAtUtc}
              onChange={(event) => setEstimatedEndAtUtc(event.target.value)}
            />
            {touched && hasRangeError ? (
              <p className="text-xs text-rose-600">End time must be after the start time.</p>
            ) : null}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">Milestones</label>
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline"
                onClick={() => setMilestones((prev) => [...prev, createBlankMilestone()])}
              >
                Add milestone
              </button>
            </div>
            <div className="space-y-2">
              {milestones.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 bg-white ${dragOverId === item.id ? 'border-primary/60 bg-primary/5' : 'border-slate-200'
                    }`}
                  draggable
                  onDragStart={handleDragStart(item.id)}
                  onDragOver={handleDragOver(item.id)}
                  onDrop={handleDrop(item.id)}
                  onDragEnd={handleDragEnd}
                >
                  <span className="material-icons-outlined text-slate-400 text-sm cursor-grab">drag_indicator</span>
                  <input
                    className="input input-bordered w-full"
                    placeholder="Milestone title"
                    value={item.title}
                    onChange={(event) =>
                      setMilestones((prev) =>
                        prev.map((milestone) =>
                          milestone.id === item.id ? { ...milestone, title: event.target.value } : milestone,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-rose-500"
                    onClick={() => setMilestones((prev) => prev.filter((milestone) => milestone.id !== item.id))}
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </div>
              ))}
              {milestones.length === 0 ? (
                <p className="text-xs text-slate-500">Add milestones to track work progress.</p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">
              {mode === 'create'
                ? 'This creates a job and saves milestones.'
                : 'This schedules the job and creates a draft invoice.'}
            </p>
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost" type="button" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Job' : 'Accept Estimate'}
              </button>
            </div>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={handleClose}>
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  )
}

function createId() {
  return Math.random().toString(36).slice(2)
}

function createBlankMilestone(): MilestoneDraft {
  return { id: createId(), title: '' }
}

function reorderMilestones(items: MilestoneDraft[], draggedId: string, targetId: string) {
  const draggedIndex = items.findIndex((item) => item.id === draggedId)
  const targetIndex = items.findIndex((item) => item.id === targetId)
  if (draggedIndex === -1 || targetIndex === -1) return items
  const next = [...items]
  const [dragged] = next.splice(draggedIndex, 1)
  next.splice(targetIndex, 0, dragged)
  return next
}
