namespace BtaDemo.Api.Application.Dtos;

public record JobDetailResponse(
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
    string? CompanyName,
    string? CompanyTaxId,
    Guid? EstimateId,
    string? Description,
    DateTime StartAtUtc,
    DateTime EstimatedEndAtUtc,
    string Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    DateTime? StartedAtUtc,
    DateTime? CompletedAtUtc,
    IReadOnlyList<JobMilestoneResponse> Milestones,
    IReadOnlyList<JobExpenseResponse> Expenses
);
