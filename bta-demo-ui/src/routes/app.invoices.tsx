import { createFileRoute } from '@tanstack/react-router'
import { InvoicesPage } from '../pages/invoices/InvoicesPage'

export const Route = createFileRoute('/app/invoices')({
  component: InvoicesPage,
})
