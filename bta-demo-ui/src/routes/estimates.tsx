import { createFileRoute } from '@tanstack/react-router'
import { EstimatesPage } from '../pages/estimates/EstimatesPage'

export const Route = createFileRoute('/estimates')({
  component: EstimatesPage,
})
