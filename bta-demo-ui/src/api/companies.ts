import { queryOptions, mutationOptions } from '@tanstack/react-query'
import { getJson, postJson, patchJson, apiFetch } from './client'
import { queryKeys } from './queryKeys'
import type { CompanyDetailResponse, CompanyResponse, CreateCompanyRequest, UpdateCompanyRequest } from './types'

export function getCompanies(includeDeleted = false) {
  const query = includeDeleted ? '?includeDeleted=true' : ''
  return getJson<CompanyResponse[]>(`/companies${query}`)
}

export function companiesQueryOptions(includeDeleted = false) {
  return queryOptions({
    queryKey: queryKeys.companies.list(includeDeleted),
    queryFn: () => getCompanies(includeDeleted),
  })
}

export function createCompany(payload: CreateCompanyRequest) {
  return postJson<CompanyResponse>('/companies', payload)
}

export function getCompany(id: string) {
  return getJson<CompanyDetailResponse>(`/companies/${id}`)
}

export function updateCompany(id: string, payload: UpdateCompanyRequest) {
  return patchJson<{ id: string; name: string }>(`/companies/${id}`, payload)
}

export function deleteCompany(id: string) {
  return apiFetch<{ id: string; isDeleted: boolean }>(`/companies/${id}`, { method: 'DELETE' })
}

export function createCompanyMutationOptions() {
  return mutationOptions({
    mutationFn: createCompany,
  })
}
