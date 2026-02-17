import type { InvoiceListResponse } from '../../api'
import { InitialsAvatar } from '../../components/InitialsAvatar'
import { StatusPill } from '../../components/StatusPill'
import { formatCurrency, formatDateString, formatInvoiceStatus } from '../../utils'
import { invoiceStatusStyles } from './billingStyles'
import { formatAddress, groupTaxLines } from './billingUtils'
import { openInvoicePrintView } from './printInvoice'

type InvoiceDetailsProps = {
  invoice: InvoiceListResponse
  onMarkPaid: () => void
  onIssue: () => void
  onEdit: () => void
  onDelete: () => void
}

export function InvoiceDetails({
  invoice,
  onMarkPaid,
  onIssue,
  onEdit,
  onDelete,
}: InvoiceDetailsProps) {
  const displayStatus = formatInvoiceStatus(invoice.status)
  const statusTone = invoiceStatusStyles[displayStatus]?.tone ?? 'bg-slate-100 text-slate-600'
  const invoiceNumber = `INV-${invoice.id.slice(0, 8).toUpperCase()}`
  const issuedDate = invoice.issuedAtUtc ? formatDateString(invoice.issuedAtUtc) : 'Draft'
  const dueDate = invoice.dueAtUtc ? formatDateString(invoice.dueAtUtc) : 'Not set'
  const leadName = invoice.leadName || 'Unknown Lead'

  const lineItems = invoice.lineItems ?? []
  const taxGroups = groupTaxLines(lineItems)
  const subtotal = invoice.subtotal ?? 0
  const taxTotal = invoice.taxTotal ?? 0
  const total = invoice.amount ?? 0

  const address = formatAddress([
    invoice.leadAddressLine1,
    invoice.leadAddressLine2,
    invoice.leadCity,
    invoice.leadState,
    invoice.leadPostalCode,
  ])

  const isDraft = displayStatus === 'Draft'
  const isEditable = displayStatus === 'Draft'
  const showMarkPaid = displayStatus === 'Issued' || displayStatus === 'Overdue'

  return (
    <aside className="w-full lg:w-96 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-fit">
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">#{invoiceNumber}</h2>
            <p className="text-xs text-slate-500 uppercase font-semibold">Issued {issuedDate}</p>
          </div>
          <StatusPill label={displayStatus} tone={statusTone} />
        </div>
        <div className="flex gap-2 justify-end flex-wrap">
          {isDraft ? (
            <button
              className="min-w-[140px] bg-primary text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90"
              onClick={onIssue}
            >
              <span className="material-icons text-sm">send</span>
              Send to Client
            </button>
          ) : null}
          {showMarkPaid ? (
            <button
              className="min-w-[140px] bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-emerald-700"
              onClick={onMarkPaid}
            >
              <span className="material-icons text-sm">check_circle</span>
              Mark Paid
            </button>
          ) : null}
          <button
            className="min-w-[140px] border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
            onClick={() => openInvoicePrintView(invoice, { autoPrint: true })}
          >
            <span className="material-icons text-sm">file_download</span>
            Download PDF
          </button>
          <button
            className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
            onClick={() => openInvoicePrintView(invoice)}
            title="Preview invoice"
          >
            <span className="material-icons text-slate-500 text-lg">print</span>
          </button>
          {isEditable ? (
            <button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50" onClick={onEdit}>
              <span className="material-icons text-slate-500 text-lg">edit</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Customer Information</h3>
          <div className="flex items-start gap-4">
            <InitialsAvatar name={leadName} size="md" />
            <div>
              <p className="font-semibold text-sm">{leadName}</p>
              {invoice.leadEmail ? <p className="text-xs text-slate-500">{invoice.leadEmail}</p> : null}
              {invoice.leadPhone ? <p className="text-xs text-slate-500">{invoice.leadPhone}</p> : null}
              <p className="text-xs text-slate-500">{address}</p>
              {invoice.companyTaxId ? (
                <p className="text-[10px] text-slate-400 mt-1">Tax ID: {invoice.companyTaxId}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Line Items</h3>
          {lineItems.length === 0 ? (
            <p className="text-xs text-slate-500">No line items added.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Description</th>
                    <th className="px-3 py-2 font-semibold text-right">Qty</th>
                    <th className="px-3 py-2 font-semibold text-right">Rate</th>
                    <th className="px-3 py-2 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map((line) => (
                    <tr key={line.id}>
                      <td className="px-3 py-2">
                        <div className="font-medium">
                          {line.isTaxLine ? `Tax - ${line.description}` : line.description}
                        </div>
                        <div className="text-xs text-slate-500">
                          {line.isTaxLine ? `${line.taxRate ?? 0}%` : 'Service line'}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {line.isTaxLine ? '-' : line.quantity}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {line.isTaxLine ? `${line.taxRate ?? 0}%` : formatCurrency(line.unitPrice ?? 0)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">
                        {formatCurrency(line.lineTotal ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Invoice Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {taxGroups.length > 0 ? (
              taxGroups.map((line) => (
                <div key={line.key} className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    {line.label} ({line.rate}%)
                  </span>
                  <span className="font-medium tabular-nums">{formatCurrency(line.total)}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax</span>
                <span className="font-medium tabular-nums">{formatCurrency(taxTotal)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <span className="font-bold">Total Due</span>
              <span className="font-bold tabular-nums text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-2">
            <span className="material-icons text-sm">payment</span>
            Payment Status
          </h3>
          <div className="space-y-1 text-xs text-slate-500">
            <p>Due: {dueDate}</p>
            {invoice.paidAtUtc ? <p>Paid: {formatDateString(invoice.paidAtUtc)}</p> : null}
          </div>
        </section>
        {invoice.notes ? (
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Notes</h3>
            <p className="text-xs text-slate-500 whitespace-pre-wrap">{invoice.notes}</p>
          </section>
        ) : null}
      </div>

      <div className="p-6 border-t border-slate-200 mt-auto">
        <button
          className="w-full text-sm font-medium text-rose-500 py-2 border border-rose-200 rounded-lg hover:bg-rose-50"
          onClick={onDelete}
        >
          Delete Invoice
        </button>
      </div>
    </aside>
  )
}
