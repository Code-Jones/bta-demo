using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Application.Dtos;

public record InvoiceListResponse(
    Guid Id,
    Guid JobId,
    Guid LeadId,
    string LeadName,
    string? LeadCompany,
    string? LeadEmail,
    string? LeadPhone,
    string? LeadAddressLine1,
    string? LeadAddressLine2,
    string? LeadCity,
    string? LeadState,
    string? LeadPostalCode,
    string? CompanyName,
    string? CompanyTaxId,
    string? JobDescription,
    DateTime? JobStartAtUtc,
    DateTime? JobEstimatedEndAtUtc,
    decimal Subtotal,
    decimal TaxTotal,
    decimal Amount,
    InvoiceStatus Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    DateTime? IssuedAtUtc,
    DateTime? DueAtUtc,
    DateTime? PaidAtUtc,
    string? Notes,
    IReadOnlyList<InvoiceLineItemResponse> LineItems
);
