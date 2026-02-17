import type { InvoiceListResponse } from '../../api'
import { escapeHtml, formatCurrency, formatDateString, formatInvoiceStatus } from '../../utils'
import { formatAddress, groupTaxLines } from './billingUtils'

export function openInvoicePrintView(invoice: InvoiceListResponse, options?: { autoPrint?: boolean }) {
  const taxGroups = groupTaxLines(invoice.lineItems ?? [])
  const win = window.open('', '_blank', 'width=960,height=720')
  if (!win) return

  const headerAddress = formatAddress(
    [
      invoice.leadAddressLine1,
      invoice.leadAddressLine2,
      invoice.leadCity,
      invoice.leadState,
      invoice.leadPostalCode,
    ],
    '',
  )

  const lineRows = (invoice.lineItems ?? [])
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

  const taxRows = taxGroups.length
    ? taxGroups
        .map((line) => {
          return `
          <tr>
            <td>${escapeHtml(`${line.label} (${line.rate}%)`)}</td>
            <td class="num">${formatCurrency(line.total)}</td>
          </tr>
        `
        })
        .join('')
    : `
        <tr>
          <td>Tax</td>
          <td class="num">${formatCurrency(invoice.taxTotal ?? 0)}</td>
        </tr>
      `

  const vendorName = 'BTA Demo Contracting'
  const vendorEmail = 'billing@btademo.com'
  const vendorPhone = '(555) 019-2000'

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice ${escapeHtml(invoice.id)}</title>
        <style>
          body { font-family: "Helvetica Neue", Arial, sans-serif; color: #0f172a; padding: 32px; }
          h1 { font-size: 24px; margin: 0; letter-spacing: 0.5px; }
          h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 24px 0 8px; }
          .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
          .meta { font-size: 12px; color: #475569; }
          .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 16px; }
          .invoice-meta { text-align: right; }
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
            <h1>Invoice</h1>
            <div class="meta">${escapeHtml(vendorName)}</div>
            <div class="meta">${escapeHtml(vendorEmail)} - ${escapeHtml(vendorPhone)}</div>
          </div>
          <div class="invoice-meta">
            <span class="badge">${escapeHtml(formatInvoiceStatus(invoice.status))}</span>
            <div class="meta">Invoice #: ${escapeHtml(`INV-${invoice.id.slice(0, 8).toUpperCase()}`)}</div>
            <div class="meta">Issued: ${invoice.issuedAtUtc ? formatDateString(invoice.issuedAtUtc) : 'Draft'}</div>
            <div class="meta">Due: ${invoice.dueAtUtc ? formatDateString(invoice.dueAtUtc) : 'Not set'}</div>
          </div>
        </div>

        <div class="row" style="margin-top: 16px;">
          <div class="card" style="flex: 1;">
            <h2>Bill To</h2>
            <div class="meta">${escapeHtml(invoice.leadName)}</div>
            ${invoice.leadEmail ? `<div class="meta">${escapeHtml(invoice.leadEmail)}</div>` : ''}
            ${invoice.leadPhone ? `<div class="meta">${escapeHtml(invoice.leadPhone)}</div>` : ''}
            ${headerAddress ? `<div class="meta">${escapeHtml(headerAddress)}</div>` : ''}
            ${invoice.companyTaxId ? `<div class="meta">Tax ID: ${escapeHtml(invoice.companyTaxId)}</div>` : ''}
          </div>
          <div class="amount-due">
            <span>Amount Due</span>
            <strong>${formatCurrency(invoice.amount ?? 0)}</strong>
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
                <td class="num">${formatCurrency(invoice.subtotal ?? 0)}</td>
              </tr>
              ${taxRows}
              <tr>
                <td class="total">Total</td>
                <td class="num total">${formatCurrency(invoice.amount ?? 0)}</td>
              </tr>
            </table>
          </div>
        </div>

        ${invoice.notes ? `<div class="card"><h2>Notes</h2><div class="meta">${escapeHtml(invoice.notes)}</div></div>` : ''}
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
