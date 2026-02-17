import { createFileRoute } from '@tanstack/react-router'
import { PipelinePage } from '../pages/pipeline/PipelinePage'

export const Route = createFileRoute('/app/pipeline')({
  component: PipelinePage,
})
