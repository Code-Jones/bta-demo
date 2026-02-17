import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

type EstimateCreateModalProps = {
  isOpen: boolean
  leadName?: string
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: { amount: number; description?: string }) => void
}

export function EstimateCreateModal({ isOpen, leadName, isSubmitting, onClose, onSubmit }: EstimateCreateModalProps) {
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const dialog = modalRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
      queueMicrotask(() => {
        setAmount('')
        setDescription('')
        setTouched(false)
      })
    } else if (dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const handleClose = () => {
    modalRef.current?.close()
    onClose()
  }

  const parsedAmount = Number(amount)
  const isValidAmount = Boolean(amount) && !Number.isNaN(parsedAmount) && parsedAmount > 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (!isValidAmount) return
    onSubmit({
      amount: parsedAmount,
      description: description.trim() || undefined,
    })
  }

  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-lg p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">Create Estimate</h3>
            <p className="text-xs text-slate-500">
              {leadName ? `Draft an estimate for ${leadName}.` : 'Draft a new estimate for this lead.'}
            </p>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose} type="button">
            <span className="material-icons text-slate-500">close</span>
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Estimate Amount</label>
            <input
              className="input input-bordered w-full"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="0.00"
              inputMode="decimal"
            />
            {touched && !isValidAmount ? (
              <p className="text-xs text-rose-600">Enter a valid amount greater than 0.</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Description (optional)</label>
            <textarea
              className="textarea textarea-bordered w-full min-h-[90px]"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Scope, assumptions, or quick notes."
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">You can refine the estimate details later.</p>
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost" type="button" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Estimate'}
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
