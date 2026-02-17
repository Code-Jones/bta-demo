using Microsoft.AspNetCore.Http;

namespace BtaDemo.Api.Application.Dtos;

public record UpdateJobExpenseRequest(
    string? Vendor,
    string? Category,
    decimal? Amount,
    DateTime? SpentAtUtc,
    string? Notes,
    IFormFile? Receipt
);
