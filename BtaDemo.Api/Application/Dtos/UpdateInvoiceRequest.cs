namespace BtaDemo.Api.Application.Dtos;

public record UpdateInvoiceRequest(
    DateTime? DueAtUtc,
    string? Notes,
    IReadOnlyList<InvoiceLineItemRequest>? LineItems
);
