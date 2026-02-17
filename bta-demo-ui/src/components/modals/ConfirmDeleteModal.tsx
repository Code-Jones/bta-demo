import { useEffect, useRef } from 'react'

export type ConfirmDeleteModalProps = {
    isOpen: boolean
    title: string
    description: string
    confirmLabel: string
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDeleteModal({ isOpen, title, description, confirmLabel, onConfirm, onCancel }: ConfirmDeleteModalProps) {
    const modalRef = useRef<HTMLDialogElement | null>(null)

    useEffect(() => {
        const dialog = modalRef.current
        if (!dialog) return
        if (isOpen) {
            if (!dialog.open) dialog.showModal()
        } else if (dialog.open) {
            dialog.close()
        }
    }, [isOpen])

    return (
        <dialog className="modal" ref={modalRef}>
            <div className="modal-box max-w-md">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 mb-6">{description}</p>
                <div className="flex justify-end gap-3">
                    <button className="btn btn-ghost" type="button" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn btn-error text-white" type="button" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onCancel}>
                <button aria-label="Close">close</button>
            </form>
        </dialog>
    )
}