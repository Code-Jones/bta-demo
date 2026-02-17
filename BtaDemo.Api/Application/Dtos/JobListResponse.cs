namespace BtaDemo.Api.Application.Dtos;

public record JobListResponse(
    Guid Id,
    Guid LeadId,
    string LeadName,
    string? LeadCompany,
    string? LeadEmail,
    string? LeadPhone,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? PostalCode,
    Guid? CompanyId,
    string? CompanyName,
    string? CompanyTaxId,
    IReadOnlyList<TaxLineResponse> LeadTaxLines,
    IReadOnlyList<TaxLineResponse> CompanyTaxLines,
    Guid? EstimateId,
    DateTime StartAtUtc,
    DateTime EstimatedEndAtUtc,
    string Status
);
