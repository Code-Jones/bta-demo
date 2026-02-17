using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Application.Dtos;

public record LeadResponse(
    Guid Id,
    string Name,
    string? Company,
    Guid? CompanyId,
    string? Phone,
    string? Email,
    DateTime CreatedAtUtc,
    LeadStatus Status,
    bool IsDeleted,
    DateTime? DeletedAtUtc
);
