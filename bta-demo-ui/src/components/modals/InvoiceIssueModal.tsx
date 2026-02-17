import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

type InvoiceIssueModalProps = {
  isOpen: boolean
  leadName?: string
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: { dueAtUtc?: string | null }) => void
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function InvoiceIssueModal({ isOpen, leadName, isSubmitting, onClose, onSubmit }: InvoiceIssueModalProps) {
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const [dueAt, setDueAt] = useState('')

  useEffect(() => {
    const dialog = modalRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
      queueMicrotask(() => {
        setDueAt(toDateInputValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)))
      })
    } else if (dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const handleClose = () => {
    modalRef.current?.close()
    onClose()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const payload = dueAt ? { dueAtUtc: new Date(dueAt).toISOString() } : { dueAtUtc: null }
    onSubmit(payload)
  }

  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-lg p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">Issue Invoice</h3>
            <p className="text-xs text-slate-500">
              {leadName ? `Set the due date for ${leadName}.` : 'Set the due date and issue this invoice.'}
            </p>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose} type="button">
            <span className="material-icons text-slate-500">close</span>
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Due Date</label>
            <input
              className="input input-bordered w-full"
              type="date"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">Overdue is derived from the due date once issued.</p>
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost" type="button" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Issuing...' : 'Issue Invoice'}
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
