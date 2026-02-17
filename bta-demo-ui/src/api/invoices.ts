import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { apiFetch, getJson, patchJson, postJson } from './client'
import { queryKeys } from './queryKeys'
import type {
  CreateInvoiceRequest,
  InvoiceListResponse,
  InvoiceMetricsResponse,
  InvoiceResponse,
  IssueInvoiceRequest,
  UpdateInvoiceRequest,
} from './types'

export function getInvoices() {
  return getJson<InvoiceListResponse[]>('/invoices')
}

export function invoicesQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.invoices.list(),
    queryFn: getInvoices,
  })
}

export function getInvoiceMetrics() {
  return getJson<InvoiceMetricsResponse>('/invoices/metrics')
}

export function invoiceMetricsQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.invoices.metrics(),
    queryFn: getInvoiceMetrics,
  })
}

export function createInvoice(payload: CreateInvoiceRequest) {
  return postJson<InvoiceResponse>('/invoices', payload)
}

export function updateInvoice(id: string, payload: UpdateInvoiceRequest) {
  return patchJson<InvoiceResponse>(`/invoices/${id}`, payload)
}

export function deleteInvoice(id: string) {
  return apiFetch<{ id: string }>(`/invoices/${id}`, { method: 'DELETE' })
}

export function markInvoicePaid(id: string) {
  return postJson<InvoiceResponse>(`/invoices/${id}/mark-paid`)
}

export function issueInvoice(id: string, payload: IssueInvoiceRequest) {
  return postJson<InvoiceResponse>(`/invoices/${id}/issue`, payload)
}

export function markInvoicePaidMutationOptions() {
  return mutationOptions({
    mutationFn: markInvoicePaid,
  })
}
