import { useAuthStore } from '../store/authStore'
import { refreshAccessToken } from './auth'

export type ApiError = {
  status: number
  message: string
  details?: unknown
}

/** Extra options for apiFetch (not part of RequestInit). */
type ApiFetchOptions = RequestInit & { skipAuth?: boolean }

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
// https://api.contractor-os.xyz

function buildUrl(path: string) {
  console.log('API_BASE_URL', API_BASE_URL);
  if (!API_BASE_URL) {
    return path;
  }

  if (API_BASE_URL.startsWith('/')) {
    const base = API_BASE_URL.replace(/\/+$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
  }

  console.log('new URL(path, API_BASE_URL)', new URL(path, API_BASE_URL).toString());
  return new URL(path, API_BASE_URL).toString();
}

async function parseError(response: Response) {
  const text = await response.text().catch(() => '');
  let message = text || response.statusText;

  if (text && text.startsWith('{')) {
    try {
      const body = JSON.parse(text) as { title?: string; detail?: string; status?: number };
      if (body.title) message = body.title;
      else if (body.detail) message = body.detail;
    } catch {
      // keep message as text
    }
  }

  return {
    status: response.status,
    message,
  } satisfies ApiError;
}

let refreshPromise: Promise<string | null> | null = null

async function doRefresh(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken ?? localStorage.getItem('refreshToken')
  if (!refreshToken) return null
  try {
    const res = await refreshAccessToken(refreshToken)
    const newToken = res.token ?? res.accessToken ?? res.access_token
    const newRefreshToken = res.refreshToken ?? res.refresh_token
    if (!newToken) {
      useAuthStore.getState().clear()
      return null
    }
    if (newRefreshToken) {
      useAuthStore.getState().setTokens(newToken, newRefreshToken)
    } else {
      useAuthStore.getState().setToken(newToken)
    }
    return newToken
  } catch {
    useAuthStore.getState().clear()
    return null
  } finally {
    refreshPromise = null
  }
}

/** One refresh in flight; others wait on the same promise. */
function refreshTokenOnce(): Promise<string | null> {
  if (!refreshPromise) refreshPromise = doRefresh()
  return refreshPromise
}

export async function apiFetch<T>(path: string, init: ApiFetchOptions = {}) {
  const { skipAuth, ...fetchInit } = init
  const token = skipAuth ? null : (useAuthStore.getState().token ?? localStorage.getItem('token'))

  const headers: HeadersInit = new Headers(fetchInit.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/json');

  const response = await fetch(buildUrl(path), {
    ...fetchInit,
    headers,
  });

  if (!response.ok) {
    const isUnauthorized = response.status === 401
    const canRefresh = !skipAuth && (useAuthStore.getState().refreshToken ?? localStorage.getItem('refreshToken'))
    if (isUnauthorized && canRefresh) {
      const newToken = await refreshTokenOnce()
      if (newToken) {
        const retryHeaders = new Headers(fetchInit.headers)
        retryHeaders.set('Authorization', `Bearer ${newToken}`)
        retryHeaders.set('Accept', 'application/json')
        const retryResponse = await fetch(buildUrl(path), { ...fetchInit, headers: retryHeaders })
        if (!retryResponse.ok) throw await parseError(retryResponse)
        if (retryResponse.status === 204) return undefined as T
        return (await retryResponse.json()) as T
      }
    }
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getJson<T>(path: string, init: ApiFetchOptions = {}) {
  return apiFetch<T>(path, { ...init, method: 'GET' });
}

export async function postJson<T>(path: string, body?: unknown, init: ApiFetchOptions = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init.headers,
  };

  const payload = body === undefined ? undefined : JSON.stringify(body);

  return apiFetch<T>(path, {
    ...init,
    method: 'POST',
    headers,
    body: payload,
  });
}

export async function patchJson<T>(path: string, body?: unknown, init: ApiFetchOptions = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init.headers,
  };

  const payload = body === undefined ? undefined : JSON.stringify(body);

  return apiFetch<T>(path, {
    ...init,
    method: 'PATCH',
    headers,
    body: payload,
  });
}
