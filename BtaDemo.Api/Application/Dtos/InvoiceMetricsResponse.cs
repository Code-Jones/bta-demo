namespace BtaDemo.Api.Application.Dtos;

public record InvoiceMetricsResponse(
    decimal OutstandingTotal,
    decimal OutstandingTotalLastMonth,
    int OutstandingOverdueCount,
    decimal PaidThisMonthTotal,
    decimal PaidLastMonthTotal,
    decimal DraftTotal,
    decimal DraftTotalLastMonth,
    int DraftCount,
    int DraftCountLastMonth,
    int AverageDaysToPay,
    int AverageDaysToPayLastMonth
);
