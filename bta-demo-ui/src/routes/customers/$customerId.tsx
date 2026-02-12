import { createFileRoute } from '@tanstack/react-router'
import { CustomerDetailPage } from '../../pages/customers/CustomerDetailPage'

export const Route = createFileRoute('/customers/$customerId')({
  component: CustomerDetailPage,
})
