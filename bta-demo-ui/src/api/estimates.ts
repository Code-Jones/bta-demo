import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { getJson, patchJson, postJson } from './client'
import { queryKeys } from './queryKeys'
import type {
  AcceptEstimateRequest,
  CreateEstimateRequest,
  EstimateListResponse,
  EstimateResponse,
  UpdateEstimateRequest,
} from './types'

export function createEstimate(payload: CreateEstimateRequest) {
  return postJson<EstimateResponse>('/estimates', payload)
}

export function getEstimates() {
  return getJson<EstimateListResponse[]>('/estimates')
}

export function sendEstimate(id: string) {
  return postJson<EstimateResponse>(`/estimates/${id}/send`)
}

export function acceptEstimate(id: string, payload: AcceptEstimateRequest) {
  return postJson<EstimateResponse>(`/estimates/${id}/accept`, payload)
}

export function rejectEstimate(id: string) {
  return postJson<EstimateResponse>(`/estimates/${id}/reject`)
}

export function updateEstimate(id: string, payload: UpdateEstimateRequest) {
  return patchJson<EstimateResponse>(`/estimates/${id}`, payload)
}

export function estimatesQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.estimates.list(),
    queryFn: getEstimates,
  })
}

export function createEstimateMutationOptions() {
  return mutationOptions({
    mutationFn: createEstimate,
  })
}

export function sendEstimateMutationOptions() {
  return mutationOptions({
    mutationFn: sendEstimate,
  })
}

export function acceptEstimateMutationOptions() {
  return mutationOptions({
    mutationFn: ({ id, payload }: { id: string; payload: AcceptEstimateRequest }) => acceptEstimate(id, payload),
  })
}
