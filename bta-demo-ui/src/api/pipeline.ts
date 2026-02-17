import { queryOptions } from '@tanstack/react-query'
import { getJson } from './client'
import { queryKeys } from './queryKeys'
import type { PipelineBoardResponse } from './types'

export function getPipelineBoard() {
  return getJson<PipelineBoardResponse>('/pipeline/board')
}

export function pipelineBoardQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.pipeline.board(),
    queryFn: getPipelineBoard,
  })
}
