namespace BtaDemo.Api.Application.Dtos;

public record CompanyResponse(
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
    DateTime UpdatedAtUtc
);
