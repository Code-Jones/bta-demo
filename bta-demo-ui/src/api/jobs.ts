import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { apiFetch, getJson, patchJson, postJson } from './client'
import { queryKeys } from './queryKeys'
import type {
  CreateJobExpenseRequest,
  CreateJobMilestoneRequest,
  CreateJobRequest,
  JobDetailResponse,
  JobExpenseResponse,
  JobListResponse,
  JobMilestoneResponse,
  JobResponse,
  UpdateJobExpenseRequest,
  UpdateJobMilestoneRequest,
} from './types'

export function getJobs() {
  return getJson<JobListResponse[]>('/jobs')
}

export function getJobDetail(id: string) {
  return getJson<JobDetailResponse>(`/jobs/${id}`)
}

export function jobsQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.jobs.list(),
    queryFn: getJobs,
  })
}

export function jobDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => getJobDetail(id),
    enabled: Boolean(id),
  })
}

export function createJob(payload: CreateJobRequest) {
  return postJson<JobResponse>('/jobs', payload)
}

export function startJob(id: string) {
  return postJson<JobResponse>(`/jobs/${id}/start`)
}

export function completeJob(id: string) {
  return postJson<JobResponse>(`/jobs/${id}/complete`)
}

export function cancelJob(id: string) {
  return postJson<JobResponse>(`/jobs/${id}/cancel`)
}

export function createJobMilestone(id: string, payload: CreateJobMilestoneRequest) {
  return postJson<JobMilestoneResponse>(`/jobs/${id}/milestones`, payload)
}

export function updateJobMilestone(id: string, milestoneId: string, payload: UpdateJobMilestoneRequest) {
  return patchJson<JobMilestoneResponse>(`/jobs/${id}/milestones/${milestoneId}`, payload)
}

export function deleteJobMilestone(id: string, milestoneId: string) {
  return apiFetch<void>(`/jobs/${id}/milestones/${milestoneId}`, { method: 'DELETE' })
}

export function createJobExpense(id: string, payload: CreateJobExpenseRequest) {
  const formData = new FormData()
  formData.append('vendor', payload.vendor)
  if (payload.category) formData.append('category', payload.category)
  formData.append('amount', String(payload.amount))
  formData.append('spentAtUtc', payload.spentAtUtc)
  if (payload.notes) formData.append('notes', payload.notes)
  if (payload.receipt) formData.append('receipt', payload.receipt)
  return apiFetch<JobExpenseResponse>(`/jobs/${id}/expenses`, { method: 'POST', body: formData })
}

export function updateJobExpense(id: string, expenseId: string, payload: UpdateJobExpenseRequest) {
  const formData = new FormData()
  if (payload.vendor !== undefined && payload.vendor !== null) formData.append('vendor', payload.vendor)
  if (payload.category !== undefined && payload.category !== null) formData.append('category', payload.category)
  if (payload.amount !== undefined && payload.amount !== null) formData.append('amount', String(payload.amount))
  if (payload.spentAtUtc !== undefined && payload.spentAtUtc !== null) formData.append('spentAtUtc', payload.spentAtUtc)
  if (payload.notes !== undefined && payload.notes !== null) formData.append('notes', payload.notes)
  if (payload.receipt) formData.append('receipt', payload.receipt)
  return apiFetch<JobExpenseResponse>(`/jobs/${id}/expenses/${expenseId}`, { method: 'PATCH', body: formData })
}

export function deleteJobExpense(id: string, expenseId: string) {
  return apiFetch<void>(`/jobs/${id}/expenses/${expenseId}`, { method: 'DELETE' })
}

export function createJobMutationOptions() {
  return mutationOptions({
    mutationFn: createJob,
  })
}
