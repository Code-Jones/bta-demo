using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Application.Dtos;

public record JobMilestoneResponse(
    Guid Id,
    string Title,
    string? Notes,
    MilestoneStatus Status,
    DateTime OccurredAtUtc,
    int SortOrder,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);
