namespace BtaDemo.Api.Application.Dtos;

public record JobExpenseResponse(
    Guid Id,
    string Vendor,
    string? Category,
    decimal Amount,
    DateTime SpentAtUtc,
    string? Notes,
    string? ReceiptUrl,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);
