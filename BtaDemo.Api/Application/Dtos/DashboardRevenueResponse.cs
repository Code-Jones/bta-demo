namespace BtaDemo.Api.Application.Dtos;

public record TrendPointResponse(
    DateTime Date,
    decimal Value
);

public record TrendChartResponse(
    IReadOnlyList<TrendPointResponse> RevenuePoints,
    IReadOnlyList<TrendPointResponse> ExpensePoints
);
