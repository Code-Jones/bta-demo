namespace BtaDemo.Api.Application.Dtos;

public record EstimateLineItemResponse(
    Guid Id,
    string Description,
    decimal Quantity,
    decimal UnitPrice,
    bool IsTaxLine,
    decimal? TaxRate,
    decimal LineTotal,
    int SortOrder
);
