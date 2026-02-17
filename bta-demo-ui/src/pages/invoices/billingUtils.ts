import type { InvoiceLineItem } from '../../api'

export function groupTaxLines(lineItems: InvoiceLineItem[]) {
  const grouped = new Map<string, { key: string; label: string; rate: number; total: number }>()
  lineItems
    .filter((line) => line.isTaxLine)
    .forEach((line) => {
      const rate = line.taxRate ?? 0
      const key = `${line.description}|${rate}`
      const existing = grouped.get(key)
      if (existing) {
        existing.total += line.lineTotal
      } else {
        grouped.set(key, {
          key,
          label: line.description,
          rate,
          total: line.lineTotal,
        })
      }
    })

  return Array.from(grouped.values())
}

export function formatAddress(parts: Array<string | null | undefined>, emptyValue = 'No address on file.') {
  const address = parts.filter(Boolean).join(', ')
  return address || emptyValue
}
