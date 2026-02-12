export type ApiError = {
  status: number
  message: string
  details?: unknown
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function buildUrl(path: string) {
  if (!API_BASE_URL) {
    return path
  }

  return new URL(path, API_BASE_URL).toString()
}

async function parseError(response: Response) {
  const text = await response.text().catch(() => '')

  return {
    status: response.status,
    message: text || response.statusText,
  } satisfies ApiError
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init.headers,
    },
  })

  if (!response.ok) {
    throw await parseError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function getJson<T>(path: string, init: RequestInit = {}) {
  return apiFetch<T>(path, { ...init, method: 'GET' })
}

export async function postJson<T>(path: string, body?: unknown, init: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init.headers,
  }

  const payload = body === undefined ? undefined : JSON.stringify(body)

  return apiFetch<T>(path, {
    ...init,
    method: 'POST',
    headers,
    body: payload,
  })
}
