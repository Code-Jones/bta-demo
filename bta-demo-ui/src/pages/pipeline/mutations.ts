import { useMutation } from "@tanstack/react-query"
import type { EstimateListResponse, JobMilestoneTemplateRequest } from "../../api/types"
import { createEstimate, sendEstimate, acceptEstimate, rejectEstimate } from '../../api/estimates'
import { startJob, completeJob } from '../../api/jobs'
import { setLeadStatus } from '../../api/leads'

export type EstimateAcceptModalState = {
    estimateId: string
    leadName: string
    needsSend?: boolean
    milestoneTemplates?: { title: string }[]
} | null



export const useCreateEstimateMutation = (refreshPipeline: () => void, handleMutationError: (error: unknown) => void, setEstimateCreate: (estimate: EstimateListResponse | null) => void) => {
    return useMutation({
        mutationFn: createEstimate,
        onSuccess: () => {
            refreshPipeline()
            setEstimateCreate(null)
        },
        onError: handleMutationError,
    })
}

export const useSendEstimateMutation = (refreshPipeline: () => void, handleMutationError: (error: unknown) => void) => {
    return useMutation({
        mutationFn: sendEstimate,
        onSuccess: refreshPipeline,
        onError: handleMutationError,
    })
}

export const useRejectEstimateMutation = (refreshPipeline: () => void, handleMutationError: (error: unknown) => void) => {
    return useMutation({
        mutationFn: rejectEstimate,
        onSuccess: refreshPipeline,
        onError: handleMutationError,
    })
}

export const useAcceptEstimateMutation = (refreshPipeline: () => void, handleMutationError: (error: unknown) => void, setEstimateAccept: (estimate: EstimateAcceptModalState) => void) => {
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { startAtUtc: string; estimatedEndAtUtc: string; milestones?: JobMilestoneTemplateRequest[] } }) =>
            acceptEstimate(id, payload),
        onSuccess: () => {
            refreshPipeline()
            setEstimateAccept(null)
        },
        onError: handleMutationError,
    })
}


export const useStartJobMutation = (refreshPipeline: () => void, handleMutationError: (error: unknown) => void) => {
    return useMutation({
        mutationFn: startJob,
        onSuccess: refreshPipeline,
        onError: handleMutationError,
    })
}

export const useCompleteJobMutation = (refreshPipeline: () => void, handleMutationError: (error: unknown) => void) => {
    return useMutation({
        mutationFn: completeJob,
        onSuccess: refreshPipeline,
        onError: handleMutationError,
    })
}
export const useUpdateLeadMutation = (refreshPipeline: () => void, handleMutationError: (error: unknown) => void) => {
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => setLeadStatus(id, status),
        onSuccess: refreshPipeline,
        onError: handleMutationError,
    })
}