namespace BtaDemo.Api.Application.Dtos;

public record InvoiceLineItemRequest(
    string Description,
    decimal Quantity,
    decimal UnitPrice,
    bool IsTaxLine,
    decimal? TaxRate,
    int SortOrder
);
