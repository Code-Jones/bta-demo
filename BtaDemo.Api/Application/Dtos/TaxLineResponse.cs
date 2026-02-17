namespace BtaDemo.Api.Application.Dtos;

public record TaxLineResponse(
    Guid Id,
    string Label,
    decimal Rate
);
