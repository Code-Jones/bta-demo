namespace BtaDemo.Api.Application.Dtos;

public record EstimateLineItemRequest(
    string Description,
    decimal Quantity,
    decimal UnitPrice,
    bool IsTaxLine,
    decimal? TaxRate,
    int SortOrder
);
