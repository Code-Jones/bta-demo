import { queryOptions } from '@tanstack/react-query'
import { getJson } from './client'
import { queryKeys } from './queryKeys'
import type { ScoreboardResponse } from './types'

export function getScoreboard() {
  return getJson<ScoreboardResponse>('/dashboard/scoreboard')
}

export function scoreboardQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.dashboard.scoreboard(),
    queryFn: getScoreboard,
  })
}
