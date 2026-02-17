import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent } from 'react'
import type { InvoiceListResponse, InvoiceLineItemRequest, JobListResponse } from '../../api'

type LineItemDraft = {
  id: string
  description: string
  quantity: string
  unitPrice: string
  isTaxLine: boolean
  taxRate: string
}

type InvoiceUpsertModalProps = {
  isOpen: boolean
  mode: 'create' | 'edit'
  jobs: JobListResponse[]
  invoice?: InvoiceListResponse | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: { jobId: string; dueAtUtc?: string | null; notes?: string | null; lineItems: InvoiceLineItemRequest[] }) => void
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function InvoiceUpsertModal({
  isOpen,
  mode,
  jobs,
  invoice,
  isSubmitting,
  onClose,
  onSubmit,
}: InvoiceUpsertModalProps) {
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const [jobId, setJobId] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([])
  const [touched, setTouched] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const selectedJob = useMemo(() => jobs.find((job) => job.id === jobId), [jobs, jobId])

  useEffect(() => {
    const dialog = modalRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
      const isEdit = mode === 'edit'
      const inv = invoice
      queueMicrotask(() => {
        setTouched(false)
        if (isEdit && inv) {
          setJobId(inv.jobId)
          setDueAt(inv.dueAtUtc ? inv.dueAtUtc.slice(0, 10) : '')
          setNotes(inv.notes ?? '')
          const mappedLines = inv.lineItems.map((line) => ({
            id:
              line.id && line.id !== '00000000-0000-0000-0000-000000000000'
                ? line.id
                : createId(),
            description: line.description,
            quantity: String(line.quantity),
            unitPrice: String(line.unitPrice),
            isTaxLine: line.isTaxLine,
            taxRate: line.taxRate ? String(line.taxRate) : '',
          }))
          setLineItems(mappedLines.length ? mappedLines : [createBlankItem()])
        } else {
          setJobId('')
          setDueAt(toDateInputValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)))
          setNotes('')
          setLineItems([createBlankItem()])
        }
      })
    } else if (dialog.open) {
      dialog.close()
    }
  }, [isOpen, mode, invoice])

  useEffect(() => {
    if (!isOpen || mode === 'edit') return
    if (!selectedJob) return
    const job = selectedJob
    queueMicrotask(() => {
      setLineItems(buildDefaultLineItems(job))
    })
  }, [isOpen, mode, selectedJob])

  const handleClose = () => {
    modalRef.current?.close()
    onClose()
  }

  const lineItemErrors = lineItems.map((line) => {
    const description = line.description.trim()
    if (!description) return 'Description is required.'
    if (line.isTaxLine) {
      const rate = Number(line.taxRate)
      if (!line.taxRate || Number.isNaN(rate) || rate < 0) return 'Tax rate must be 0 or greater.'
      return ''
    }
    const quantity = Number(line.quantity)
    const unitPrice = Number(line.unitPrice)
    if (!line.quantity || Number.isNaN(quantity) || quantity <= 0) return 'Quantity must be greater than 0.'
    if (!line.unitPrice || Number.isNaN(unitPrice) || unitPrice < 0) return 'Rate must be 0 or greater.'
    return ''
  })

  const hasLineErrors = lineItemErrors.some(Boolean)
  const hasBillableLine = lineItems.some((line) => !line.isTaxLine)

  const subtotal = lineItems
    .filter((line) => !line.isTaxLine)
    .reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0)
  const taxTotal = lineItems
    .filter((line) => line.isTaxLine)
    .reduce((sum, line) => sum + subtotal * (Number(line.taxRate || 0) / 100), 0)
  const total = subtotal + taxTotal

  const handleLineChange = (id: string, field: keyof LineItemDraft) => (event: ChangeEvent<HTMLInputElement>) => {
    setLineItems((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: event.target.value } : line)))
    setTouched(true)
  }

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
    setLineItems((prev) => reorderLineItems(prev, draggedId, id))
    setDraggingId(null)
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverId(null)
  }

  const addLineItem = () => setLineItems((prev) => [...prev, createBlankItem()])
  const addTaxLine = () => setLineItems((prev) => [...prev, createBlankTaxItem()])
  const removeLine = (id: string) => setLineItems((prev) => prev.filter((line) => line.id !== id))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (!jobId) return
    if (!hasBillableLine || hasLineErrors) return

    const payloadLineItems = lineItems.map((line, index) => ({
      description: line.description.trim(),
      quantity: line.isTaxLine ? 1 : Number(line.quantity),
      unitPrice: line.isTaxLine ? 0 : Number(line.unitPrice),
      isTaxLine: line.isTaxLine,
      taxRate: line.isTaxLine ? Number(line.taxRate) : null,
      sortOrder: index + 1,
    }))

    const payload = {
      jobId,
      dueAtUtc: dueAt ? new Date(dueAt).toISOString() : null,
      notes: notes.trim() || null,
      lineItems: payloadLineItems,
    }

    onSubmit(payload)
  }

  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-4xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">{mode === 'edit' ? 'Edit Invoice' : 'Create Invoice'}</h3>
            <p className="text-xs text-slate-500">
              {mode === 'edit'
                ? 'Adjust line items, taxes, and due dates.'
                : 'Create a draft invoice with line items and taxes.'}
            </p>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose} type="button">
            <span className="material-icons text-slate-500">close</span>
          </button>
        </div>
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Job</label>
                <select
                  className="select select-bordered w-full"
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                  disabled={mode === 'edit'}
                >
                  <option value="">Select a job</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.leadName} {job.leadCompany ? `· ${job.leadCompany}` : ''}
                    </option>
                  ))}
                </select>
                {touched && !jobId ? (
                  <p className="text-xs text-rose-600">Select a job to invoice.</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Due Date</label>
                <input
                  className="input input-bordered w-full"
                  type="date"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Internal Notes</label>
                <textarea
                  className="textarea textarea-bordered w-full min-h-[110px]"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Payment notes, delivery method, or reminders."
                />
              </div>
              {selectedJob ? (
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-700">{selectedJob.leadName}</p>
                  {selectedJob.leadEmail ? <p>{selectedJob.leadEmail}</p> : null}
                  {selectedJob.leadPhone ? <p>{selectedJob.leadPhone}</p> : null}
                  <p>
                    {[selectedJob.addressLine1, selectedJob.addressLine2, selectedJob.city, selectedJob.state, selectedJob.postalCode]
                      .filter(Boolean)
                      .join(', ') || 'No address on file.'}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">Line Items</label>
                <div className="flex items-center gap-2">
                  <button className="btn btn-sm btn-outline" type="button" onClick={addLineItem}>
                    <span className="material-icons text-sm">add</span>
                    Add item
                  </button>
                  <button className="btn btn-sm btn-outline" type="button" onClick={addTaxLine}>
                    <span className="material-icons text-sm">percent</span>
                    Add tax
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {lineItems.map((line, index) => {
                  const isDragging = draggingId === line.id
                  const isOver = dragOverId === line.id && draggingId !== line.id
                  return (
                    <div
                      key={line.id}
                      className={`border border-slate-200 rounded-lg p-3 space-y-3 bg-white ${isDragging ? 'opacity-70' : ''
                        } ${isOver ? 'ring-2 ring-primary/20' : ''}`}
                      onDragOver={handleDragOver(line.id)}
                      onDrop={handleDrop(line.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <span
                            className="material-icons text-sm cursor-grab text-slate-400"
                            draggable
                            onDragStart={handleDragStart(line.id)}
                            onDragEnd={handleDragEnd}
                          >
                            drag_indicator
                          </span>
                          {line.isTaxLine ? 'Tax Line' : `Item ${index + 1}`}
                        </div>
                        <button
                          className="btn btn-ghost btn-xs text-rose-600"
                          type="button"
                          onClick={() => removeLine(line.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-3">
                        <div className="space-y-1">
                          <input
                            className="input input-bordered w-full"
                            value={line.description}
                            onChange={handleLineChange(line.id, 'description')}
                            placeholder={line.isTaxLine ? 'Tax label' : 'Service description'}
                          />
                          {touched && lineItemErrors[index] ? (
                            <p className="text-xs text-rose-600">{lineItemErrors[index]}</p>
                          ) : null}
                        </div>
                        {line.isTaxLine ? (
                          <div className="relative">
                            <input
                              className="input input-bordered w-full pr-8"
                              value={line.taxRate}
                              onChange={handleLineChange(line.id, 'taxRate')}
                              placeholder="0.00"
                              inputMode="decimal"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                          </div>
                        ) : (
                          <input
                            className="input input-bordered w-full"
                            value={line.quantity}
                            onChange={handleLineChange(line.id, 'quantity')}
                            placeholder="Qty"
                            inputMode="decimal"
                          />
                        )}
                        {line.isTaxLine ? (
                          <div className="text-right text-sm text-slate-600 font-medium">
                            {currencyFormatter.format(subtotal * (Number(line.taxRate || 0) / 100))}
                          </div>
                        ) : (
                          <input
                            className="input input-bordered w-full"
                            value={line.unitPrice}
                            onChange={handleLineChange(line.id, 'unitPrice')}
                            placeholder="Rate"
                            inputMode="decimal"
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {!hasBillableLine && touched ? (
                <p className="text-xs text-rose-600">Add at least one billable line item.</p>
              ) : null}
              <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold">{currencyFormatter.format(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tax</span>
                  <span className="font-semibold">{currencyFormatter.format(taxTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{currencyFormatter.format(total)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">
              {mode === 'edit'
                ? 'Updates will refresh the invoice totals.'
                : 'Draft invoices can be issued to the client.'}
            </p>
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost" type="button" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Invoice'}
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

function buildDefaultLineItems(job: JobListResponse) {
  const items: LineItemDraft[] = [
    {
      id: createId(),
      description: 'Service work',
      quantity: '1',
      unitPrice: '',
      isTaxLine: false,
      taxRate: '',
    },
  ]

  const taxLines = dedupeTaxLines([...job.leadTaxLines, ...job.companyTaxLines])
  taxLines.forEach((line) => {
    items.push({
      id: createId(),
      description: line.label,
      quantity: '1',
      unitPrice: '0',
      isTaxLine: true,
      taxRate: String(line.rate),
    })
  })

  return items
}

function dedupeTaxLines(lines: { label: string; rate: number }[]) {
  const seen = new Map<string, number>()
  lines.forEach((line) => {
    const key = `${line.label}|${line.rate}`
    if (!seen.has(key)) {
      seen.set(key, line.rate)
    }
  })
  return Array.from(seen.keys()).map((key) => {
    const [label] = key.split('|')
    return { label, rate: seen.get(key) ?? 0 }
  })
}

function createBlankItem(): LineItemDraft {
  return {
    id: createId(),
    description: '',
    quantity: '1',
    unitPrice: '',
    isTaxLine: false,
    taxRate: '',
  }
}

function createBlankTaxItem(): LineItemDraft {
  return {
    id: createId(),
    description: '',
    quantity: '1',
    unitPrice: '0',
    isTaxLine: true,
    taxRate: '',
  }
}

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now() + Math.random())
}

function reorderLineItems(items: LineItemDraft[], fromId: string, toId: string) {
  const fromIndex = items.findIndex((item) => item.id === fromId)
  const toIndex = items.findIndex((item) => item.id === toId)
  if (fromIndex === -1 || toIndex === -1) return items

  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}
