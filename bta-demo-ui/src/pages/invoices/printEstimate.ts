import type { EstimateListResponse } from '../../api'
import { escapeHtml, formatCurrency, formatDateString, formatEstimateStatus } from '../../utils'
import { formatAddress } from './billingUtils'

export function openEstimatePrintView(estimate: EstimateListResponse, options?: { autoPrint?: boolean }) {
  const win = window.open('', '_blank', 'width=960,height=720')
  if (!win) return

  const headerAddress = formatAddress(
    [
      estimate.leadAddressLine1,
      estimate.leadAddressLine2,
      estimate.leadCity,
      estimate.leadState,
      estimate.leadPostalCode,
    ],
    '',
  )

  const lineRows = (estimate.lineItems ?? [])
    .map((line) => {
      const qty = line.isTaxLine ? '-' : String(line.quantity)
      const rate = line.isTaxLine ? `${line.taxRate ?? 0}%` : formatCurrency(line.unitPrice ?? 0)
      const label = line.isTaxLine ? `Tax - ${line.description}` : line.description
      return `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td class="num">${escapeHtml(qty)}</td>
          <td class="num">${escapeHtml(rate)}</td>
          <td class="num">${formatCurrency(line.lineTotal ?? 0)}</td>
        </tr>
      `
    })
    .join('')

  const vendorName = 'BTA Demo Contracting'
  const vendorEmail = 'billing@btademo.com'
  const vendorPhone = '(555) 019-2000'
  const leadName = estimate.leadName || 'Unknown Lead'

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Estimate ${escapeHtml(estimate.id)}</title>
        <style>
          body { font-family: "Helvetica Neue", Arial, sans-serif; color: #0f172a; padding: 32px; }
          h1 { font-size: 24px; margin: 0; letter-spacing: 0.5px; }
          h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 24px 0 8px; }
          .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
          .meta { font-size: 12px; color: #475569; }
          .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 16px; }
          .estimate-meta { text-align: right; }
          .amount-due { background: #0f172a; color: #fff; padding: 12px 16px; border-radius: 12px; text-align: right; min-width: 180px; }
          .amount-due span { display: block; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #cbd5f5; }
          .amount-due strong { font-size: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border-bottom: 1px solid #e2e8f0; padding: 8px 4px; font-size: 12px; text-align: left; }
          th { text-transform: uppercase; color: #64748b; font-size: 11px; }
          .num { text-align: right; }
          .summary { margin-top: 12px; width: 280px; margin-left: auto; }
          .summary table { width: 100%; }
          .summary td { border: none; padding: 4px 0; }
          .total { font-weight: 700; font-size: 14px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; background: #e2e8f0; }
          @media print { body { padding: 0; } .card { break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="row">
          <div>
            <h1>Estimate</h1>
            <div class="meta">${escapeHtml(vendorName)}</div>
            <div class="meta">${escapeHtml(vendorEmail)} - ${escapeHtml(vendorPhone)}</div>
          </div>
          <div class="estimate-meta">
            <span class="badge">${escapeHtml(formatEstimateStatus(estimate.status))}</span>
            <div class="meta">Estimate #: ${escapeHtml(`EST-${estimate.id.slice(0, 8).toUpperCase()}`)}</div>
            <div class="meta">Created: ${formatDateString(estimate.createdAtUtc)}</div>
            <div class="meta">Sent: ${estimate.sentAtUtc ? formatDateString(estimate.sentAtUtc) : 'Not sent'}</div>
          </div>
        </div>

        <div class="row" style="margin-top: 16px;">
          <div class="card" style="flex: 1;">
            <h2>Bill To</h2>
            <div class="meta">${escapeHtml(leadName)}</div>
            ${estimate.leadEmail ? `<div class="meta">${escapeHtml(estimate.leadEmail)}</div>` : ''}
            ${estimate.leadPhone ? `<div class="meta">${escapeHtml(estimate.leadPhone)}</div>` : ''}
            ${headerAddress ? `<div class="meta">${escapeHtml(headerAddress)}</div>` : ''}
            ${estimate.companyTaxId ? `<div class="meta">Tax ID: ${escapeHtml(estimate.companyTaxId)}</div>` : ''}
          </div>
          <div class="amount-due">
            <span>Estimate Total</span>
            <strong>${formatCurrency(estimate.amount ?? 0)}</strong>
          </div>
        </div>

        <div class="card">
          <h2>Line Items</h2>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="num">Qty</th>
                <th class="num">Rate</th>
                <th class="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineRows}
            </tbody>
          </table>

          <div class="summary">
            <table>
              <tr>
                <td>Subtotal</td>
                <td class="num">${formatCurrency(estimate.subtotal ?? 0)}</td>
              </tr>
              <tr>
                <td>Tax</td>
                <td class="num">${formatCurrency(estimate.taxTotal ?? 0)}</td>
              </tr>
              <tr>
                <td class="total">Total</td>
                <td class="num total">${formatCurrency(estimate.amount ?? 0)}</td>
              </tr>
            </table>
          </div>
        </div>
      </body>
    </html>
  `

  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
  if (options?.autoPrint) {
    win.onload = () => win.print()
  }
}
