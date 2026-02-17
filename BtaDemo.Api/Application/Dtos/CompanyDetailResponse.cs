namespace BtaDemo.Api.Application.Dtos;

public record CompanyDetailResponse(
    Guid Id,
    string Name,
    string? Phone,
    string? Email,
    string? Website,
    string? Notes,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    string? TaxId,
    bool IsDeleted,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    DateTime? DeletedAtUtc,
    IReadOnlyList<TaxLineResponse> TaxLines
);
