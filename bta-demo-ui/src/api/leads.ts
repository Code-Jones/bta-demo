import { mutationOptions } from '@tanstack/react-query'
import { postJson } from './client'
import type { CreateLeadRequest, CreateLeadResponse } from './types'

export function createLead(payload: CreateLeadRequest) {
  return postJson<CreateLeadResponse>('/leads', payload)
}

export function createLeadMutationOptions() {
  return mutationOptions({
    mutationFn: createLead,
  })
}
