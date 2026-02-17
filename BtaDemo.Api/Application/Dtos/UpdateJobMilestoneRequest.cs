using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Application.Dtos;

public record UpdateJobMilestoneRequest(
    string? Title,
    string? Notes,
    MilestoneStatus? Status,
    DateTime? OccurredAtUtc,
    int? SortOrder
);
