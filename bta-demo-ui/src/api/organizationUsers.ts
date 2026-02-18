import { queryOptions } from '@tanstack/react-query'
import { apiFetch, getJson, postJson } from './client'
import { queryKeys } from './queryKeys'
import type { CreateOrganizationUserRequest, OrganizationUserResponse } from './types'

export function getOrganizationUsers() {
  return getJson<OrganizationUserResponse[]>('/organization/users')
}

export function organizationUsersQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.organizationUsers.list(),
    queryFn: getOrganizationUsers,
  })
}

export function createOrganizationUser(payload: CreateOrganizationUserRequest) {
  return postJson<OrganizationUserResponse>('/organization/users', payload)
}

export function deleteOrganizationUser(id: string) {
  return apiFetch<void>(`/organization/users/${id}`, { method: 'DELETE' })
}
