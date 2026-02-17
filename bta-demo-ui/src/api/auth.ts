import { queryOptions } from '@tanstack/react-query'
import { getJson, postJson } from './client'
import { queryKeys } from './queryKeys'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, LogoutResponse, MeResponse, RefreshRequest, RefreshResponse } from './types'


export function getAuthMe() {
  return getJson<MeResponse>('/auth/me')
}

export function authMeQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.auth.me(),
    queryFn: getAuthMe,
  })
}


export function login(payload: LoginRequest) {
  return postJson<LoginResponse>('/auth/login', payload)
}

export function loginQueryOptions(payload: LoginRequest) {
  return queryOptions({
    queryKey: queryKeys.auth.login(),
    queryFn: () => login(payload),
  })
}

export function register(payload: RegisterRequest) {
  return postJson<RegisterResponse>('/auth/register', payload)
}

export function registerQueryOptions(payload: RegisterRequest) {
  return queryOptions({
    queryKey: queryKeys.auth.register(),
    queryFn: () => register(payload),
  })
}

/** Call refresh endpoint with refreshToken only (no Bearer). Used by client when access token expires. */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
  return postJson<RefreshResponse>('/auth/refresh', { refreshToken } as RefreshRequest, { skipAuth: true })
}

export function logout() {
  return postJson<LogoutResponse>('/auth/logout')
}

export function logoutQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.auth.logout(),
    queryFn: logout,
  })
}
