using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Application.Dtos;

public record EstimateListResponse(
    Guid Id,
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
    string? Description,
    decimal Subtotal,
    decimal TaxTotal,
    decimal Amount,
    EstimateStatus Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    DateTime? SentAtUtc,
    DateTime? AcceptedAtUtc,
    DateTime? RejectedAtUtc,
    IReadOnlyList<EstimateLineItemResponse> LineItems
);
