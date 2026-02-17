namespace BtaDemo.Api.Application.Dtos;

public record CreateInvoiceRequest(
    Guid JobId,
    DateTime? DueAtUtc,
    string? Notes,
    IReadOnlyList<InvoiceLineItemRequest> LineItems
);
