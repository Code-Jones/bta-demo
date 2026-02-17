import { createFileRoute } from '@tanstack/react-router'
import { JobsPage } from '../pages/jobs/JobsPage'

export const Route = createFileRoute('/app/jobs')({
  component: JobsPage,
})
