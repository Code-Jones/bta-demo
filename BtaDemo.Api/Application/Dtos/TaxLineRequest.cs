namespace BtaDemo.Api.Application.Dtos;

public record TaxLineRequest(
    string Label,
    decimal Rate
);
