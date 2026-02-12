namespace BtaDemo.Api.Application.Dtos;

public record CreateJobRequest(
    Guid LeadId,
    Guid? EstimateId,
    string? Description,
    DateTime ScheduledForUtc
);