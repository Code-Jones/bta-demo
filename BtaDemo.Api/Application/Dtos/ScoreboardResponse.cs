namespace BtaDemo.Api.Application.Dtos;

public record ScoreboardResponse(
    int Leads,
    int EstimatesDraft,
    int EstimatesSent,
    int EstimatesAccepted,
    int EstimatesRejected,
    int JobsScheduled,
    int InvoicesPaid,
    int InvoicesUnpaid,
    int InvoicesOverdue,
    decimal TotalRevenuePaid,
    DateTime StartDate,
    DateTime EndDate,
    ScoreboardComparisonResponse Previous
);

public record ScoreboardComparisonResponse(
    int Leads,
    int EstimatesSent,
    int EstimatesAccepted,
    int JobsScheduled,
    int InvoicesPaid,
    decimal TotalRevenuePaid
);
