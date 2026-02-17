using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Application.Dtos;

public record CreateJobMilestoneRequest(
    string Title,
    string? Notes,
    MilestoneStatus? Status,
    DateTime? OccurredAtUtc
);
