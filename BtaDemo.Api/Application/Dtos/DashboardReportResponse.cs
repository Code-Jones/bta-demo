using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Application.Dtos;

public record DashboardLeadReportItem(
    Guid Id,
    string Name,
    string? Company,
    LeadStatus Status,
    DateTime CreatedAtUtc
);

public record DashboardEstimateReportItem(
    Guid Id,
    string LeadName,
    decimal Amount,
    EstimateStatus Status,
    DateTime CreatedAtUtc,
    DateTime? SentAtUtc
);

public record DashboardJobReportItem(
    Guid Id,
    string LeadName,
    JobStatus Status,
    DateTime StartAtUtc,
    DateTime EstimatedEndAtUtc
);

public record DashboardReportResponse(
    ScoreboardResponse Scoreboard,
    TrendChartResponse ChartData,
    IReadOnlyList<DashboardLeadReportItem> Leads,
    IReadOnlyList<DashboardEstimateReportItem> Estimates,
    IReadOnlyList<DashboardJobReportItem> Jobs
);
