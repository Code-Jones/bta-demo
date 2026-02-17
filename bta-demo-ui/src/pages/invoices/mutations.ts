import { QueryClient, useMutation } from "@tanstack/react-query"
import { createInvoice, deleteInvoice, issueInvoice, markInvoicePaid, updateInvoice } from "../../api/invoices"
import { queryKeys } from "../../api/queryKeys"
import type { EstimateListResponse, InvoiceListResponse, JobMilestoneTemplateRequest } from "../../api/types"
import { createEstimate, updateEstimate, sendEstimate, rejectEstimate, acceptEstimate } from "../../api/estimates"

export const useCreateInvoiceMutation = (queryClient: QueryClient, setCreateOpen: (open: boolean) => void) => {
    return useMutation({
        mutationFn: createInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.list() })
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.metrics() })
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenue() })
            setCreateOpen(false)
        },
    })
}

export const useUpdateInvoiceMutation = (queryClient: QueryClient, setEditInvoice: (invoice: InvoiceListResponse | null) => void) => {
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateInvoice>[1] }) => updateInvoice(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.list() })
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.metrics() })
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenue() })
            setEditInvoice(null)
        },
    })
}

export const useDeleteInvoiceMutation = (queryClient: QueryClient, setConfirmDelete: (invoice: InvoiceListResponse | null) => void) => {
    return useMutation({
        mutationFn: deleteInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.list() })
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.metrics() })
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenue() })
            setConfirmDelete(null)
        },
    })
}

export const useIssueInvoiceMutation = (queryClient: QueryClient, setIssueInvoiceModal: (invoice: InvoiceListResponse | null) => void) => {
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { dueAtUtc?: string | null } }) => issueInvoice(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.list() })
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.metrics() })
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenue() })
            setIssueInvoiceModal(null)
        },
    })
}

export const useMarkPaidMutation = (queryClient: QueryClient) => {
    return useMutation({
        mutationFn: markInvoicePaid,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.list() })
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.metrics() })
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenue() })
        },
    })
}

export const useCreateEstimateMutation = (queryClient: QueryClient, setCreateEstimateOpen: (open: boolean) => void) => {
    return useMutation({
        mutationFn: createEstimate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.estimates.list() })
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenue() })
            setCreateEstimateOpen(false)
        },
    })
}

export const useUpdateEstimateMutation = (queryClient: QueryClient, setEditEstimate: (estimate: EstimateListResponse | null) => void) => {
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateEstimate>[1] }) =>
            updateEstimate(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.estimates.list() })
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenue() })
            setEditEstimate(null)
        },
    })
}

export const useSendEstimateMutation = (queryClient: QueryClient) => {
    return useMutation({
        mutationFn: sendEstimate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.estimates.list() })
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenue() })
        },
    })
}

export const useRejectEstimateMutation = (queryClient: QueryClient) => {
    return useMutation({
        mutationFn: rejectEstimate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.estimates.list() })
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenue() })
        },
    })
}

export type EstimateAcceptModalState = {
    estimateId: string
    leadName: string
    needsSend?: boolean
    milestoneTemplates?: { title: string }[]
} | null

export const useAcceptEstimateMutation = (queryClient: QueryClient, setEstimateAccept: (value: EstimateAcceptModalState) => void) => {
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { startAtUtc: string; estimatedEndAtUtc: string; milestones?: JobMilestoneTemplateRequest[] } }) =>
            acceptEstimate(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.estimates.list() })
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.revenue() })
            setEstimateAccept(null)
        },
    })
}
