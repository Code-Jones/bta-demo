import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { getJson, patchJson, postJson, apiFetch } from './client'
import { queryKeys } from './queryKeys'
import type {
  CreateLeadRequest,
  CreateLeadResponse,
  LeadMetricsResponse,
  LeadDetailResponse,
  LeadResponse,
  SetLeadStatusRequest,
  UpdateLeadRequest,
} from './types'

export function getLeads(includeDeleted = false) {
  const query = includeDeleted ? '?includeDeleted=true' : ''
  return getJson<LeadResponse[]>(`/leads${query}`)
}

export function leadsQueryOptions(includeDeleted = false) {
  return queryOptions({
    queryKey: queryKeys.leads.list(includeDeleted),
    queryFn: () => getLeads(includeDeleted),
  })
}

export function createLead(payload: CreateLeadRequest) {
  return postJson<CreateLeadResponse>('/leads', payload)
}

export function getLead(id: string) {
  return getJson<LeadDetailResponse>(`/leads/${id}`)
}

export function updateLead(id: string, payload: UpdateLeadRequest) {
  return patchJson<{ id: string; status: string }>(`/leads/${id}`, payload)
}

export function deleteLead(id: string) {
  return apiFetch<{ id: string; isDeleted: boolean }>(`/leads/${id}`, { method: 'DELETE' })
}

export function setLeadStatus(id: string, status: string) {
  const payload: SetLeadStatusRequest = { status }
  return postJson<{ id: string; status: string }>(`/leads/${id}/status`, payload)
}

export function getLeadMetrics() {
  return getJson<LeadMetricsResponse>('/leads/metrics')
}

export function createLeadMutationOptions() {
  return mutationOptions({
    mutationFn: createLead,
  })
}
