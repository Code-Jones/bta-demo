namespace BtaDemo.Api.Application.Dtos;

public record CreateCompanyRequest(
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
    IReadOnlyList<TaxLineRequest>? TaxLines
);
