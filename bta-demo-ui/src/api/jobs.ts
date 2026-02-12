import { mutationOptions } from '@tanstack/react-query'
import { postJson } from './client'
import type { CreateJobRequest, JobResponse } from './types'

export function createJob(payload: CreateJobRequest) {
  return postJson<JobResponse>('/jobs', payload)
}

export function createJobMutationOptions() {
  return mutationOptions({
    mutationFn: createJob,
  })
}
