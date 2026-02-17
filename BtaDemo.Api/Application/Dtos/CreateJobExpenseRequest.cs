using Microsoft.AspNetCore.Http;

namespace BtaDemo.Api.Application.Dtos;

public record CreateJobExpenseRequest(
    string Vendor,
    string? Category,
    decimal Amount,
    DateTime SpentAtUtc,
    string? Notes,
    IFormFile? Receipt
);
