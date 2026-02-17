import type { EstimateListResponse } from '../../api'
import { EstimateStatus } from '../../api'
import { InitialsAvatar } from '../../components/InitialsAvatar'
import { StatusPill } from '../../components/StatusPill'
import { formatCurrency, formatDateString, formatEstimateStatus } from '../../utils'
import { estimateStatusStyles } from './billingStyles'
import { formatAddress } from './billingUtils'
import { openEstimatePrintView } from './printEstimate'

type EstimateDetailsProps = {
  estimate: EstimateListResponse
  onSend: () => void
  onAccept: () => void
  onReject: () => void
  onEdit: () => void
}

export function EstimateDetails({
  estimate,
  onSend,
  onAccept,
  onReject,
  onEdit,
}: EstimateDetailsProps) {
  const displayStatus = formatEstimateStatus(estimate.status)
  const statusTone = estimateStatusStyles[displayStatus]?.tone ?? 'bg-slate-100 text-slate-600'
  const estimateNumber = `EST-${estimate.id.slice(0, 8).toUpperCase()}`
  const createdDate = formatDateString(estimate.createdAtUtc)
  const sentDate = estimate.sentAtUtc ? formatDateString(estimate.sentAtUtc) : 'Not sent'
  const lineItems = estimate.lineItems ?? []
  const leadName = estimate.leadName || 'Unknown Lead'
  const address = formatAddress([
    estimate.leadAddressLine1,
    estimate.leadAddressLine2,
    estimate.leadCity,
    estimate.leadState,
    estimate.leadPostalCode,
  ])

  const isDraft = estimate.status === EstimateStatus.Draft
  const isFinal = estimate.status === EstimateStatus.Accepted || estimate.status === EstimateStatus.Rejected

  return (
    <aside className="w-full lg:w-96 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-fit">
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">#{estimateNumber}</h2>
            <p className="text-xs text-slate-500 uppercase font-semibold">Created {createdDate}</p>
          </div>
          <StatusPill label={displayStatus} tone={statusTone} />
        </div>
        <div className="flex gap-2 justify-end flex-wrap">
          {isDraft ? (
            <button
              className="min-w-[140px] bg-primary text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90"
              onClick={onSend}
            >
              <span className="material-icons text-sm">send</span>
              Send to Client
            </button>
          ) : null}
          {!isFinal ? (
            <button
              className="min-w-[140px] bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-emerald-700"
              onClick={onAccept}
            >
              <span className="material-icons text-sm">check_circle</span>
              Mark Accepted
            </button>
          ) : null}
          {!isFinal ? (
            <button
              className="min-w-[140px] border border-rose-200 text-rose-600 py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-rose-50"
              onClick={onReject}
            >
              <span className="material-icons text-sm">cancel</span>
              Mark Rejected
            </button>
          ) : null}
          <button
            className="min-w-[140px] border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
            onClick={() => openEstimatePrintView(estimate, { autoPrint: true })}
          >
            <span className="material-icons text-sm">file_download</span>
            Download PDF
          </button>
          <button
            className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
            onClick={() => openEstimatePrintView(estimate)}
            title="Preview estimate"
          >
            <span className="material-icons text-slate-500 text-lg">print</span>
          </button>
          {isDraft ? (
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
              {estimate.leadEmail ? <p className="text-xs text-slate-500">{estimate.leadEmail}</p> : null}
              {estimate.leadPhone ? <p className="text-xs text-slate-500">{estimate.leadPhone}</p> : null}
              <p className="text-xs text-slate-500">{address}</p>
              {estimate.companyTaxId ? (
                <p className="text-[10px] text-slate-400 mt-1">Tax ID: {estimate.companyTaxId}</p>
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
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Estimate Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium tabular-nums">{formatCurrency(estimate.subtotal ?? 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tax</span>
              <span className="font-medium tabular-nums">{formatCurrency(estimate.taxTotal ?? 0)}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold tabular-nums text-primary">{formatCurrency(estimate.amount ?? 0)}</span>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-2">
            <span className="material-icons text-sm">schedule</span>
            Estimate Timeline
          </h3>
          <div className="space-y-1 text-xs text-slate-500">
            <p>Sent: {sentDate}</p>
            {estimate.acceptedAtUtc ? <p>Accepted: {formatDateString(estimate.acceptedAtUtc)}</p> : null}
            {estimate.rejectedAtUtc ? <p>Rejected: {formatDateString(estimate.rejectedAtUtc)}</p> : null}
          </div>
        </section>
      </div>
    </aside>
  )
}
