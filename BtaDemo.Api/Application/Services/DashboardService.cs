using BtaDemo.Api.Data;
using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Domain.Enum;
using Microsoft.EntityFrameworkCore;

namespace BtaDemo.Api.Application.Services;

public class DashboardService
{
    private readonly AppDbContext _dbContext;
    public DashboardService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<ScoreboardResponse> GetScoreboardAsync(CancellationToken cancellationToken = default)
    {

        var leads = await _dbContext.Leads.CountAsync(cancellationToken);
        var estimatesDraft = await _dbContext.Estimates.CountAsync(e => e.Status == EstimateStatus.Draft, cancellationToken);
        var estimatesSent = await _dbContext.Estimates.CountAsync(e => e.Status == EstimateStatus.Sent, cancellationToken);
        var estimatesAccepted = await _dbContext.Estimates.CountAsync(e => e.Status == EstimateStatus.Accepted, cancellationToken);
        var estimatesRejected = await _dbContext.Estimates.CountAsync(e => e.Status == EstimateStatus.Rejected, cancellationToken);
        var jobsScheduled = await _dbContext.Jobs.CountAsync(e => e.Status == JobStatus.Scheduled, cancellationToken);
        var invoicesPaid = await _dbContext.Invoices.CountAsync(e => e.Status == InvoiceStatus.Paid, cancellationToken);
        var invoicesUnpaid = await _dbContext.Invoices.CountAsync(e => e.Status != InvoiceStatus.Paid, cancellationToken);
        var invoicesOverdue = await _dbContext.Invoices.CountAsync(e => e.Status == InvoiceStatus.Overdue, cancellationToken);
        var totalRevenuePaid = await _dbContext.Invoices.Where(e => e.Status == InvoiceStatus.Paid).SumAsync(e => (decimal?) e.Amount, cancellationToken) ?? 0;

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
            totalRevenuePaid
        );
    }
}