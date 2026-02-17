namespace BtaDemo.Api.Application.Dtos;

public record LeadMetricsResponse(
    int NewLeadsThisMonth,
    int NewLeadsLastMonth,
    int LeadsWithSentEstimatesThisMonth,
    int LeadsWithSentEstimatesLastMonth,
    int LeadsWithJobs,
    int TotalLeads,
    decimal ConversionRate,
    decimal ConversionRateLastMonth
);
