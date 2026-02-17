namespace BtaDemo.Api.Application.Dtos;

public record CreateEstimateRequest(
    Guid LeadId,
    decimal Amount,
    string? Description,
    IReadOnlyList<EstimateLineItemRequest>? LineItems
);
