import { queryOptions } from '@tanstack/react-query'
import { getJson } from './client'
import { queryKeys } from './queryKeys'
import type { DashboardReportResponse, TrendChartResponse, ScoreboardResponse } from './types'

type DashboardRangeParams = {
  startDate: Date
  endDate: Date
}

function buildRangeQuery(params?: DashboardRangeParams) {
  if (!params?.startDate && !params?.endDate) return ''
  const query = new URLSearchParams()
  if (params?.startDate) query.set('startDate', params.startDate.toISOString())
  if (params?.endDate) query.set('endDate', params.endDate.toISOString())
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export function getScoreboard(params?: DashboardRangeParams) {
  return getJson<ScoreboardResponse>(`/dashboard/scoreboard${buildRangeQuery(params)}`)
}

export function scoreboardQueryOptions(params: DashboardRangeParams) {
  return queryOptions({
    queryKey: queryKeys.dashboard.scoreboardRange(params.startDate.toISOString(), params.endDate.toISOString()),
    queryFn: () => getScoreboard(params),
  })
}

export function getTrendChart(params?: DashboardRangeParams) {
  return getJson<TrendChartResponse>(`/dashboard/revenue${buildRangeQuery(params)}`)
}

export function trendChartQueryOptions(params: DashboardRangeParams) {
  return queryOptions({
    queryKey: queryKeys.dashboard.revenueRange(params.startDate.toISOString(), params.endDate.toISOString()),
    queryFn: () => getTrendChart(params),
  })
}

export function getDashboardReport(params?: DashboardRangeParams) {
  return getJson<DashboardReportResponse>(`/dashboard/report${buildRangeQuery(params)}`)
}
