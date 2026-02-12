import { mutationOptions } from '@tanstack/react-query'
import { postJson } from './client'
import type { CreateEstimateRequest, EstimateResponse } from './types'

export function createEstimate(payload: CreateEstimateRequest) {
  return postJson<EstimateResponse>('/estimates', payload)
}

export function sendEstimate(id: string) {
  return postJson<EstimateResponse>(`/estimates/${id}/send`)
}

export function acceptEstimate(id: string) {
  return postJson<EstimateResponse>(`/estimates/${id}/accept`)
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
    mutationFn: acceptEstimate,
  })
}
