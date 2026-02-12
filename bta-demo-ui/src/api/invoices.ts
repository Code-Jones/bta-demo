import { mutationOptions } from '@tanstack/react-query'
import { postJson } from './client'
import type { InvoiceResponse } from './types'

export function markInvoicePaid(id: string) {
  return postJson<InvoiceResponse>(`/invoices/${id}/mark-paid`)
}

export function markInvoicePaidMutationOptions() {
  return mutationOptions({
    mutationFn: markInvoicePaid,
  })
}
