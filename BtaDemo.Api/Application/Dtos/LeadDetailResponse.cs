using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Application.Dtos;

public record LeadDetailResponse(
    Guid Id,
    string Name,
    string? Company,
    Guid? CompanyId,
    string? Phone,
    string? Email,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    string? LeadSource,
    string? ProjectType,
    decimal? EstimatedValue,
    string? Notes,
    LeadStatus Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    DateTime? LostAtUtc,
    bool IsDeleted,
    DateTime? DeletedAtUtc,
    IReadOnlyList<TaxLineResponse> TaxLines
);
