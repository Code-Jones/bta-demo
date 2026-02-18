using BtaDemo.Api.Data;
using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Domain.Enum;
using Microsoft.EntityFrameworkCore;

namespace BtaDemo.Api.Application.Services;

public class DashboardService
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUser _currentUser;
    public DashboardService(AppDbContext dbContext, ICurrentUser currentUser)
    {
        _dbContext = dbContext;
        _currentUser = currentUser;
    }

    public async Task<ScoreboardResponse> GetScoreboardAsync(
        DateTime? startDateUtc,
        DateTime? endDateUtc,
        CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var utcNow = DateTime.UtcNow;
        var (startDate, endDate, previousStart, previousEnd) = ResolveRange(startDateUtc, endDateUtc, utcNow);

        var leads = await _dbContext.Leads
            .CountAsync(x => x.OrganizationId == organizationId && !x.IsDeleted && x.CreatedAtUtc >= startDate && x.CreatedAtUtc <= endDate, cancellationToken);
        var leadsPrevious = await _dbContext.Leads
            .CountAsync(x => x.OrganizationId == organizationId && !x.IsDeleted && x.CreatedAtUtc >= previousStart && x.CreatedAtUtc <= previousEnd, cancellationToken);

        var estimatesDraft = await _dbContext.Estimates
            .CountAsync(e => e.OrganizationId == organizationId && e.Status == EstimateStatus.Draft && e.CreatedAtUtc >= startDate && e.CreatedAtUtc <= endDate, cancellationToken);
        var estimatesSent = await _dbContext.Estimates
            .CountAsync(e => e.OrganizationId == organizationId && e.Status == EstimateStatus.Sent && e.CreatedAtUtc >= startDate && e.CreatedAtUtc <= endDate, cancellationToken);
        var estimatesAccepted = await _dbContext.Estimates
            .CountAsync(e => e.OrganizationId == organizationId && e.Status == EstimateStatus.Accepted && e.CreatedAtUtc >= startDate && e.CreatedAtUtc <= endDate, cancellationToken);
        var estimatesRejected = await _dbContext.Estimates
            .CountAsync(e => e.OrganizationId == organizationId && e.Status == EstimateStatus.Rejected && e.CreatedAtUtc >= startDate && e.CreatedAtUtc <= endDate, cancellationToken);

        var estimatesSentPrevious = await _dbContext.Estimates
            .CountAsync(e => e.OrganizationId == organizationId && e.Status == EstimateStatus.Sent && e.CreatedAtUtc >= previousStart && e.CreatedAtUtc <= previousEnd, cancellationToken);
        var estimatesAcceptedPrevious = await _dbContext.Estimates
            .CountAsync(e => e.OrganizationId == organizationId && e.Status == EstimateStatus.Accepted && e.CreatedAtUtc >= previousStart && e.CreatedAtUtc <= previousEnd, cancellationToken);

        var jobsScheduled = await _dbContext.Jobs
            .CountAsync(e => e.OrganizationId == organizationId && e.Status == JobStatus.Scheduled && e.CreatedAtUtc >= startDate && e.CreatedAtUtc <= endDate, cancellationToken);
        var jobsScheduledPrevious = await _dbContext.Jobs
            .CountAsync(e => e.OrganizationId == organizationId && e.Status == JobStatus.Scheduled && e.CreatedAtUtc >= previousStart && e.CreatedAtUtc <= previousEnd, cancellationToken);

        var invoicesPaid = await _dbContext.Invoices
            .CountAsync(e => e.OrganizationId == organizationId && e.Status == InvoiceStatus.Paid && e.CreatedAtUtc >= startDate && e.CreatedAtUtc <= endDate, cancellationToken);
        var invoicesPaidPrevious = await _dbContext.Invoices
            .CountAsync(e => e.OrganizationId == organizationId && e.Status == InvoiceStatus.Paid && e.CreatedAtUtc >= previousStart && e.CreatedAtUtc <= previousEnd, cancellationToken);
        var invoicesUnpaid = await _dbContext.Invoices
            .CountAsync(e => e.OrganizationId == organizationId && e.Status != InvoiceStatus.Paid && e.CreatedAtUtc >= startDate && e.CreatedAtUtc <= endDate, cancellationToken);
        var invoicesOverdue = await _dbContext.Invoices.CountAsync(
            e => e.OrganizationId == organizationId
                 && (e.Status == InvoiceStatus.Overdue || (e.Status == InvoiceStatus.Issued && e.DueAtUtc != null && e.DueAtUtc < utcNow))
                 && e.CreatedAtUtc >= startDate
                 && e.CreatedAtUtc <= endDate,
            cancellationToken);
        var totalRevenuePaid = await _dbContext.Invoices
            .Where(e => e.OrganizationId == organizationId)
            .Where(e => e.Status == InvoiceStatus.Paid && e.PaidAtUtc != null && e.PaidAtUtc >= startDate && e.PaidAtUtc <= endDate)
            .SumAsync(e => (decimal?)e.Amount, cancellationToken) ?? 0;
        var totalRevenuePaidPrevious = await _dbContext.Invoices
            .Where(e => e.OrganizationId == organizationId)
            .Where(e => e.Status == InvoiceStatus.Paid && e.PaidAtUtc != null && e.PaidAtUtc >= previousStart && e.PaidAtUtc <= previousEnd)
            .SumAsync(e => (decimal?)e.Amount, cancellationToken) ?? 0;

        return new ScoreboardResponse(
            leads,
            estimatesDraft,
            estimatesSent,
            estimatesAccepted,
            estimatesRejected,
            jobsScheduled,
            invoicesPaid,
            invoicesUnpaid,
            invoicesOverdue,
            totalRevenuePaid,
            startDate,
            endDate,
            new ScoreboardComparisonResponse(
                leadsPrevious,
                estimatesSentPrevious,
                estimatesAcceptedPrevious,
                jobsScheduledPrevious,
                invoicesPaidPrevious,
                totalRevenuePaidPrevious
            )
        );
    }

    public async Task<TrendChartResponse> GetRevenueSeriesAsync(
        DateTime? startDateUtc,
        DateTime? endDateUtc,
        CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var utcNow = DateTime.UtcNow;
        var (startDate, endDate, _, _) = ResolveRange(startDateUtc, endDateUtc, utcNow);

        var paidInvoices = await _dbContext.Invoices
            .Where(e => e.OrganizationId == organizationId)
            .Where(e => e.Status == InvoiceStatus.Paid && e.PaidAtUtc != null && e.PaidAtUtc >= startDate && e.PaidAtUtc <= endDate)
            .Select(e => new { e.PaidAtUtc, e.Amount })
            .ToListAsync(cancellationToken);

        var jobExpenses = await _dbContext.JobExpenses
            .Where(e => e.OrganizationId == organizationId && e.SpentAtUtc >= startDate && e.SpentAtUtc <= endDate)
            .Select(e => new { e.SpentAtUtc, e.Amount })
            .ToListAsync(cancellationToken);

        var points = paidInvoices
            .GroupBy(e => e.PaidAtUtc!.Value.Date)
            .Select(group => new TrendPointResponse(group.Key, group.Sum(e => e.Amount)))
            .OrderBy(point => point.Date)
            .ToList();

        var expensePoints = jobExpenses
            .GroupBy(e => e.SpentAtUtc.Date)
            .Select(group => new TrendPointResponse(group.Key, group.Sum(e => e.Amount)))
            .OrderBy(point => point.Date)
            .ToList();

        return new TrendChartResponse(points, expensePoints);
    }

    public async Task<DashboardReportResponse> GetReportAsync(
        DateTime? startDateUtc,
        DateTime? endDateUtc,
        CancellationToken cancellationToken = default)
    {
        var organizationId = GetOrganizationId();
        var utcNow = DateTime.UtcNow;
        var (startDate, endDate, _, _) = ResolveRange(startDateUtc, endDateUtc, utcNow);

        var scoreboard = await GetScoreboardAsync(startDate, endDate, cancellationToken);
        var chartData = await GetRevenueSeriesAsync(startDate, endDate, cancellationToken);

        var leads = await _dbContext.Leads
            .Where(x => x.OrganizationId == organizationId && !x.IsDeleted && x.Status != LeadStatus.Lost && x.CreatedAtUtc >= startDate && x.CreatedAtUtc <= endDate)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new DashboardLeadReportItem(
                x.Id,
                x.Name,
                x.Company,
                x.Status,
                x.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        var estimates = await _dbContext.Estimates
            .Include(x => x.Lead)
            .Where(x => x.OrganizationId == organizationId && x.Status != EstimateStatus.Rejected && x.CreatedAtUtc >= startDate && x.CreatedAtUtc <= endDate)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new DashboardEstimateReportItem(
                x.Id,
                x.Lead != null ? x.Lead.Name : "Lead",
                x.Amount,
                x.Status,
                x.CreatedAtUtc,
                x.SentAtUtc
            ))
            .ToListAsync(cancellationToken);

        var jobs = await _dbContext.Jobs
            .Include(x => x.Lead)
            .Where(x => x.OrganizationId == organizationId && (x.Status == JobStatus.Scheduled || x.Status == JobStatus.InProgress)
                        && x.CreatedAtUtc >= startDate
                        && x.CreatedAtUtc <= endDate)
            .OrderByDescending(x => x.StartAtUtc)
            .Select(x => new DashboardJobReportItem(
                x.Id,
                x.Lead != null ? x.Lead.Name : "Job",
                x.Status,
                x.StartAtUtc,
                x.EstimatedEndAtUtc
            ))
            .ToListAsync(cancellationToken);

        return new DashboardReportResponse(scoreboard, chartData, leads, estimates, jobs);
    }

    private Guid GetOrganizationId()
    {
        var organizationId = _currentUser.OrganizationId;
        if (organizationId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Organization scope missing");
        }

        return organizationId;
    }

    private static (DateTime StartDate, DateTime EndDate, DateTime PreviousStart, DateTime PreviousEnd) ResolveRange(
        DateTime? startDateUtc,
        DateTime? endDateUtc,
        DateTime utcNow)
    {
        var end = endDateUtc?.ToUniversalTime() ?? utcNow;
        var start = startDateUtc?.ToUniversalTime() ?? end.AddDays(-30);

        if (start > end)
        {
            var temp = start;
            start = end;
            end = temp;
        }

        var span = end - start;
        if (span.TotalDays < 1)
        {
            span = TimeSpan.FromDays(30);
            start = end.AddDays(-30);
        }

        var previousEnd = start;
        var previousStart = start - span;
        return (start, end, previousStart, previousEnd);
    }
}
