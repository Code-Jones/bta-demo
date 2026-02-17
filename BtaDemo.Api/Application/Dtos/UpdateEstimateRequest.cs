namespace BtaDemo.Api.Application.Dtos;

public record UpdateEstimateRequest(
    string? Description,
    IReadOnlyList<EstimateLineItemRequest>? LineItems
);
