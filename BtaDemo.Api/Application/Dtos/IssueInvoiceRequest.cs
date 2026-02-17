namespace BtaDemo.Api.Application.Dtos;

public record IssueInvoiceRequest(
    DateTime? DueAtUtc
);
