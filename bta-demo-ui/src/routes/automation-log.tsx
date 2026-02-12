import { createFileRoute } from '@tanstack/react-router'
import { AutomationLogPage } from '../pages/automation/AutomationLogPage'

export const Route = createFileRoute('/automation-log')({
  component: AutomationLogPage,
})
