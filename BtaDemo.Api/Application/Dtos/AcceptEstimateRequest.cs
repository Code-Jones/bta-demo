namespace BtaDemo.Api.Application.Dtos;

public record AcceptEstimateRequest(
    DateTime StartAtUtc,
    DateTime EstimatedEndAtUtc,
    IReadOnlyList<JobMilestoneTemplateRequest>? Milestones
);
