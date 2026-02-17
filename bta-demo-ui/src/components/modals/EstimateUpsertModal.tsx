import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent } from 'react'
import type { EstimateLineItemRequest, EstimateListResponse, LeadResponse } from '../../api'

type LineItemDraft = {
  id: string
  description: string
  quantity: string
  unitPrice: string
  isTaxLine: boolean
  taxRate: string
}

type EstimateUpsertModalProps = {
  isOpen: boolean
  mode: 'create' | 'edit'
  leads: LeadResponse[]
  estimate?: EstimateListResponse | null
  leadId?: string | null
  leadName?: string | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: {
    leadId: string
    amount: number
    description?: string | null
    lineItems: EstimateLineItemRequest[]
  }) => void
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function EstimateUpsertModal({
  isOpen,
  mode,
  leads,
  estimate,
  leadId,
  leadName,
  isSubmitting,
  onClose,
  onSubmit,
}: EstimateUpsertModalProps) {
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [description, setDescription] = useState('')
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([])
  const [touched, setTouched] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const effectiveSelectedLeadId = mode === 'create' && leadId ? leadId : selectedLeadId
  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === effectiveSelectedLeadId),
    [leads, effectiveSelectedLeadId],
  )
  const isLockedToLead = Boolean(leadId)

  useEffect(() => {
    const dialog = modalRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
      const isEdit = mode === 'edit'
      const currentEstimate = estimate
      queueMicrotask(() => {
        setTouched(false)
        if (isEdit && currentEstimate) {
          setSelectedLeadId(currentEstimate.leadId)
          setDescription(currentEstimate.description ?? '')
          const mappedLines = currentEstimate.lineItems.map((line) => ({
            id: line.id && line.id !== '00000000-0000-0000-0000-000000000000' ? line.id : createId(),
            description: line.description,
            quantity: String(line.quantity),
            unitPrice: String(line.unitPrice),
            isTaxLine: line.isTaxLine,
            taxRate: line.taxRate ? String(line.taxRate) : '',
          }))
          setLineItems(mappedLines.length ? mappedLines : [createBlankItem()])
        } else {
          setSelectedLeadId(leadId ?? '')
          setDescription('')
          setLineItems([createBlankItem()])
        }
      })
    } else if (dialog.open) {
      dialog.close()
    }
  }, [isOpen, mode, estimate, leadId])

  const handleClose = () => {
    modalRef.current?.close()
    onClose()
  }

  const lineItemErrors = lineItems.map((line) => {
    const descriptionValue = line.description.trim()
    if (!descriptionValue) return 'Description is required.'
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
    if (!effectiveSelectedLeadId) return
    if (!hasBillableLine || hasLineErrors) return

    const payloadLineItems = lineItems.map((line, index) => ({
      description: line.description.trim(),
      quantity: line.isTaxLine ? 1 : Number(line.quantity),
      unitPrice: line.isTaxLine ? 0 : Number(line.unitPrice),
      isTaxLine: line.isTaxLine,
      taxRate: line.isTaxLine ? Number(line.taxRate) : null,
      sortOrder: index + 1,
    }))

    onSubmit({
      leadId: effectiveSelectedLeadId,
      amount: Number.isFinite(total) ? total : 0,
      description: description.trim() || null,
      lineItems: payloadLineItems,
    })
  }

  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-4xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">{mode === 'edit' ? 'Edit Estimate' : 'Create Estimate'}</h3>
            <p className="text-xs text-slate-500">
              {mode === 'edit'
                ? 'Adjust line items, taxes, and summary notes.'
                : 'Draft an estimate with line items and taxes.'}
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
                <label className="text-xs font-semibold text-slate-600">Lead</label>
                <select
                  className="select select-bordered w-full"
                  value={effectiveSelectedLeadId}
                  onChange={(event) => setSelectedLeadId(event.target.value)}
                  disabled={mode === 'edit' || isLockedToLead}
                >
                  <option value="">Select a lead</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} {lead.company ? `· ${lead.company}` : ''}
                    </option>
                  ))}
                </select>
                {touched && !effectiveSelectedLeadId ? (
                  <p className="text-xs text-rose-600">Select a lead for this estimate.</p>
                ) : null}
                {isLockedToLead && leadName ? (
                  <p className="text-xs text-slate-400">Created for {leadName}.</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Summary Notes</label>
                <textarea
                  className="textarea textarea-bordered w-full min-h-[100px]"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Scope, assumptions, or quick notes."
                />
              </div>
              {selectedLead ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                  <p className="font-semibold text-slate-600 mb-1">Lead Snapshot</p>
                  <p>{selectedLead.email || 'No email on file.'}</p>
                  <p>{selectedLead.phone || 'No phone on file.'}</p>
                </div>
              ) : null}
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Estimate Totals</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold">{currencyFormatter.format(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tax</span>
                    <span className="font-semibold">{currencyFormatter.format(taxTotal)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold text-primary">{currencyFormatter.format(total)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="btn btn-sm btn-outline" onClick={addLineItem}>
                  <span className="material-icons text-sm">add</span>
                  Add Line
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={addTaxLine}>
                  <span className="material-icons text-sm">receipt_long</span>
                  Add Tax Line
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-[2fr_1fr_1fr_120px] gap-3 text-[11px] font-semibold uppercase text-slate-400">
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="space-y-3">
              {lineItems.map((line, index) => (
                <div
                  key={line.id}
                  className={`rounded-lg border px-3 py-3 bg-white grid grid-cols-[2fr_1fr_1fr_120px] gap-3 items-center ${dragOverId === line.id ? 'border-primary/50 bg-primary/5' : 'border-slate-200'
                    }`}
                  draggable
                  onDragStart={handleDragStart(line.id)}
                  onDragOver={handleDragOver(line.id)}
                  onDrop={handleDrop(line.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div>
                    <input
                      className="input input-bordered w-full"
                      value={line.description}
                      onChange={handleLineChange(line.id, 'description')}
                      placeholder={line.isTaxLine ? 'Tax description' : 'Service or material'}
                    />
                    {touched && lineItemErrors[index] ? (
                      <p className="text-[11px] text-rose-600 mt-1">{lineItemErrors[index]}</p>
                    ) : null}
                  </div>
                  <div>
                    {line.isTaxLine ? (
                      <input
                        className="input input-bordered w-full text-right"
                        value={line.taxRate}
                        onChange={handleLineChange(line.id, 'taxRate')}
                        placeholder="0"
                        inputMode="decimal"
                      />
                    ) : (
                      <input
                        className="input input-bordered w-full text-right"
                        value={line.quantity}
                        onChange={handleLineChange(line.id, 'quantity')}
                        placeholder="1"
                        inputMode="decimal"
                      />
                    )}
                  </div>
                  <div>
                    {line.isTaxLine ? (
                      <div className="text-right text-xs font-semibold text-slate-400">%</div>
                    ) : (
                      <input
                        className="input input-bordered w-full text-right"
                        value={line.unitPrice}
                        onChange={handleLineChange(line.id, 'unitPrice')}
                        placeholder="0.00"
                        inputMode="decimal"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        setLineItems((prev) =>
                          prev.map((item) =>
                            item.id === line.id ? { ...item, isTaxLine: !item.isTaxLine } : item,
                          ),
                        )
                      }
                    >
                      {line.isTaxLine ? 'Tax' : 'Item'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm text-rose-500" onClick={() => removeLine(line.id)}>
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">Drag rows to reorder line items.</p>
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost" type="button" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting || hasLineErrors || !hasBillableLine}>
                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Estimate' : 'Create Estimate'}
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
    description: 'Sales Tax',
    quantity: '1',
    unitPrice: '0',
    isTaxLine: true,
    taxRate: '0',
  }
}

function reorderLineItems(items: LineItemDraft[], draggedId: string, targetId: string) {
  const draggedIndex = items.findIndex((line) => line.id === draggedId)
  const targetIndex = items.findIndex((line) => line.id === targetId)
  if (draggedIndex === -1 || targetIndex === -1) return items
  const next = [...items]
  const [dragged] = next.splice(draggedIndex, 1)
  next.splice(targetIndex, 0, dragged)
  return next
}
