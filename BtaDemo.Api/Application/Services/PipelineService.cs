using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Data;
using BtaDemo.Api.Domain.Enum;
using Microsoft.EntityFrameworkCore;

namespace BtaDemo.Api.Application.Services;

public class PipelineService
{
    private readonly AppDbContext _dbContext;
    private const int DefaultItemLimit = 6;

    public PipelineService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<PipelineBoardResponse> GetBoardAsync(CancellationToken cancellationToken = default)
    {
        var utcNow = DateTime.UtcNow;

        var leadIdsWithEstimates = _dbContext.Estimates
            .Select(e => e.LeadId)
            .Distinct();

        var leadsWithoutEstimates = _dbContext.Leads
            .Where(x => !x.IsDeleted && !leadIdsWithEstimates.Contains(x.Id));

        var leadsQuery = leadsWithoutEstimates
            .Where(x => x.Status == LeadStatus.New)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "lead",
                x.Name,
                string.IsNullOrWhiteSpace(x.Company) ? "Lead" : x.Company!,
                x.EstimatedValue,
                x.Status.ToString(),
                x.CreatedAtUtc
            ))
            .Take(DefaultItemLimit);

        var lostLeadsQuery = leadsWithoutEstimates
            .Where(x => x.Status == LeadStatus.Lost)
            .OrderByDescending(x => x.LostAtUtc ?? x.CreatedAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "lead",
                x.Name,
                string.IsNullOrWhiteSpace(x.Company) ? "Lost lead" : x.Company!,
                x.EstimatedValue,
                x.Status.ToString(),
                x.LostAtUtc ?? x.UpdatedAtUtc
            ))
            .Take(DefaultItemLimit);

        var draftEstimatesQuery = _dbContext.Estimates
            .Where(x => x.Status == EstimateStatus.Draft)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "estimate",
                x.Lead != null ? x.Lead.Name : "Estimate",
                x.Description ?? "Draft estimate",
                x.Amount,
                x.Status.ToString(),
                x.CreatedAtUtc
            ))
            .Take(DefaultItemLimit);

        var sentEstimatesQuery = _dbContext.Estimates
            .Where(x => x.Status == EstimateStatus.Sent)
            .OrderByDescending(x => x.SentAtUtc ?? x.CreatedAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "estimate",
                x.Lead != null ? x.Lead.Name : "Estimate",
                x.Description ?? "Sent estimate",
                x.Amount,
                x.Status.ToString(),
                x.SentAtUtc ?? x.CreatedAtUtc
            ))
            .Take(DefaultItemLimit);

        var acceptedEstimatesQuery = _dbContext.Estimates
            .Where(x => x.Status == EstimateStatus.Accepted)
            .OrderByDescending(x => x.AcceptedAtUtc ?? x.CreatedAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "estimate",
                x.Lead != null ? x.Lead.Name : "Estimate",
                x.Description ?? "Accepted estimate",
                x.Amount,
                x.Status.ToString(),
                x.AcceptedAtUtc ?? x.UpdatedAtUtc
            ))
            .Take(DefaultItemLimit);

        var rejectedEstimatesQuery = _dbContext.Estimates
            .Where(x => x.Status == EstimateStatus.Rejected)
            .OrderByDescending(x => x.RejectedAtUtc ?? x.CreatedAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "estimate",
                x.Lead != null ? x.Lead.Name : "Estimate",
                x.Description ?? "Rejected estimate",
                x.Amount,
                x.Status.ToString(),
                x.RejectedAtUtc ?? x.UpdatedAtUtc
            ))
            .Take(DefaultItemLimit);

        var scheduledJobsQuery = _dbContext.Jobs
            .Where(x => x.Status == JobStatus.Scheduled)
            .OrderBy(x => x.StartAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "job",
                x.Lead != null ? x.Lead.Name : "Job",
                x.Description ?? "Scheduled job",
                x.Estimate != null ? x.Estimate.Amount : null,
                x.Status.ToString(),
                x.StartAtUtc
            ))
            .Take(DefaultItemLimit);

        var inProgressJobsQuery = _dbContext.Jobs
            .Where(x => x.Status == JobStatus.InProgress)
            .OrderByDescending(x => x.StartedAtUtc ?? x.StartAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "job",
                x.Lead != null ? x.Lead.Name : "Job",
                x.Description ?? "In progress",
                x.Estimate != null ? x.Estimate.Amount : null,
                x.Status.ToString(),
                x.StartedAtUtc ?? x.StartAtUtc
            ))
            .Take(DefaultItemLimit);

        var completedJobsQuery = _dbContext.Jobs
            .Where(x => x.Status == JobStatus.Completed)
            .OrderByDescending(x => x.CompletedAtUtc ?? x.UpdatedAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "job",
                x.Lead != null ? x.Lead.Name : "Job",
                x.Description ?? "Completed job",
                x.Estimate != null ? x.Estimate.Amount : null,
                x.Status.ToString(),
                x.CompletedAtUtc ?? x.UpdatedAtUtc
            ))
            .Take(DefaultItemLimit);

        var draftInvoicesQuery = _dbContext.Invoices
            .Where(x => x.Status == InvoiceStatus.Draft)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "invoice",
                x.Job != null && x.Job.Lead != null ? x.Job.Lead.Name : "Invoice",
                "Draft invoice",
                x.Amount,
                x.Status.ToString(),
                x.CreatedAtUtc
            ))
            .Take(DefaultItemLimit);

        var issuedInvoicesQuery = _dbContext.Invoices
            .Where(x => x.Status == InvoiceStatus.Issued && (x.DueAtUtc == null || x.DueAtUtc >= utcNow))
            .OrderByDescending(x => x.IssuedAtUtc ?? x.CreatedAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "invoice",
                x.Job != null && x.Job.Lead != null ? x.Job.Lead.Name : "Invoice",
                "Invoice issued",
                x.Amount,
                x.Status.ToString(),
                x.IssuedAtUtc ?? x.CreatedAtUtc
            ))
            .Take(DefaultItemLimit);

        var overdueInvoicesQuery = _dbContext.Invoices
            .Where(x => x.Status == InvoiceStatus.Overdue || (x.Status == InvoiceStatus.Issued && x.DueAtUtc != null && x.DueAtUtc < utcNow))
            .OrderByDescending(x => x.DueAtUtc ?? x.IssuedAtUtc ?? x.CreatedAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "invoice",
                x.Job != null && x.Job.Lead != null ? x.Job.Lead.Name : "Invoice",
                "Invoice overdue",
                x.Amount,
                "Overdue",
                x.DueAtUtc ?? x.IssuedAtUtc ?? x.CreatedAtUtc
            ))
            .Take(DefaultItemLimit);

        var paidInvoicesQuery = _dbContext.Invoices
            .Where(x => x.Status == InvoiceStatus.Paid)
            .OrderByDescending(x => x.PaidAtUtc ?? x.UpdatedAtUtc)
            .Select(x => new PipelineItemResponse(
                x.Id,
                "invoice",
                x.Job != null && x.Job.Lead != null ? x.Job.Lead.Name : "Invoice",
                "Invoice paid",
                x.Amount,
                x.Status.ToString(),
                x.PaidAtUtc ?? x.UpdatedAtUtc
            ))
            .Take(DefaultItemLimit);

        var leadsCount = await leadsWithoutEstimates.CountAsync(x => x.Status == LeadStatus.New, cancellationToken);
        var leadsLostCount = await leadsWithoutEstimates.CountAsync(x => x.Status == LeadStatus.Lost, cancellationToken);
        var draftCount = await _dbContext.Estimates.CountAsync(x => x.Status == EstimateStatus.Draft, cancellationToken);
        var sentCount = await _dbContext.Estimates.CountAsync(x => x.Status == EstimateStatus.Sent, cancellationToken);
        var acceptedCount = await _dbContext.Estimates.CountAsync(x => x.Status == EstimateStatus.Accepted, cancellationToken);
        var rejectedCount = await _dbContext.Estimates.CountAsync(x => x.Status == EstimateStatus.Rejected, cancellationToken);
        var scheduledCount = await _dbContext.Jobs.CountAsync(x => x.Status == JobStatus.Scheduled, cancellationToken);
        var inProgressCount = await _dbContext.Jobs.CountAsync(x => x.Status == JobStatus.InProgress, cancellationToken);
        var completedCount = await _dbContext.Jobs.CountAsync(x => x.Status == JobStatus.Completed, cancellationToken);
        var draftInvoiceCount = await _dbContext.Invoices.CountAsync(x => x.Status == InvoiceStatus.Draft, cancellationToken);
        var issuedInvoiceCount = await _dbContext.Invoices.CountAsync(x => x.Status == InvoiceStatus.Issued && (x.DueAtUtc == null || x.DueAtUtc >= utcNow), cancellationToken);
        var overdueInvoiceCount = await _dbContext.Invoices.CountAsync(x => x.Status == InvoiceStatus.Overdue || (x.Status == InvoiceStatus.Issued && x.DueAtUtc != null && x.DueAtUtc < utcNow), cancellationToken);
        var paidInvoiceCount = await _dbContext.Invoices.CountAsync(x => x.Status == InvoiceStatus.Paid, cancellationToken);

        var leadsTotal = await leadsWithoutEstimates.Where(x => x.Status == LeadStatus.New)
            .SumAsync(x => (decimal?)x.EstimatedValue, cancellationToken);
        var leadsLostTotal = await leadsWithoutEstimates.Where(x => x.Status == LeadStatus.Lost)
            .SumAsync(x => (decimal?)x.EstimatedValue, cancellationToken);
        var draftTotal = await _dbContext.Estimates.Where(x => x.Status == EstimateStatus.Draft)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken);
        var sentTotal = await _dbContext.Estimates.Where(x => x.Status == EstimateStatus.Sent)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken);
        var acceptedTotal = await _dbContext.Estimates.Where(x => x.Status == EstimateStatus.Accepted)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken);
        var rejectedTotal = await _dbContext.Estimates.Where(x => x.Status == EstimateStatus.Rejected)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken);
        var scheduledTotal = await _dbContext.Jobs
            .Where(x => x.Status == JobStatus.Scheduled)
            .Select(x => x.Estimate != null ? (decimal?)x.Estimate.Amount : null)
            .SumAsync(cancellationToken);
        var inProgressTotal = await _dbContext.Jobs
            .Where(x => x.Status == JobStatus.InProgress)
            .Select(x => x.Estimate != null ? (decimal?)x.Estimate.Amount : null)
            .SumAsync(cancellationToken);
        var completedTotal = await _dbContext.Jobs
            .Where(x => x.Status == JobStatus.Completed)
            .Select(x => x.Estimate != null ? (decimal?)x.Estimate.Amount : null)
            .SumAsync(cancellationToken);
        var draftInvoiceTotal = await _dbContext.Invoices.Where(x => x.Status == InvoiceStatus.Draft)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken);
        var issuedInvoiceTotal = await _dbContext.Invoices.Where(x => x.Status == InvoiceStatus.Issued && (x.DueAtUtc == null || x.DueAtUtc >= utcNow))
            .SumAsync(x => (decimal?)x.Amount, cancellationToken);
        var overdueInvoiceTotal = await _dbContext.Invoices.Where(x => x.Status == InvoiceStatus.Overdue || (x.Status == InvoiceStatus.Issued && x.DueAtUtc != null && x.DueAtUtc < utcNow))
            .SumAsync(x => (decimal?)x.Amount, cancellationToken);
        var paidInvoiceTotal = await _dbContext.Invoices.Where(x => x.Status == InvoiceStatus.Paid)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken);

        var columns = new List<PipelineColumnResponse>
        {
            new(
                "leads",
                "Leads",
                leadsCount,
                leadsTotal ?? 0,
                await leadsQuery.ToListAsync(cancellationToken)
            ),
            new(
                "leadsLost",
                "Leads Lost",
                leadsLostCount,
                leadsLostTotal ?? 0,
                await lostLeadsQuery.ToListAsync(cancellationToken)
            ),
            new(
                "estimatesDraft",
                "Estimates (Draft)",
                draftCount,
                draftTotal ?? 0,
                await draftEstimatesQuery.ToListAsync(cancellationToken)
            ),
            new(
                "estimatesSent",
                "Estimates (Sent)",
                sentCount,
                sentTotal ?? 0,
                await sentEstimatesQuery.ToListAsync(cancellationToken)
            ),
            new(
                "estimatesAccepted",
                "Accepted",
                acceptedCount,
                acceptedTotal ?? 0,
                await acceptedEstimatesQuery.ToListAsync(cancellationToken)
            ),
            new(
                "estimatesRejected",
                "Declined",
                rejectedCount,
                rejectedTotal ?? 0,
                await rejectedEstimatesQuery.ToListAsync(cancellationToken)
            ),
            new(
                "jobsScheduled",
                "Jobs Scheduled",
                scheduledCount,
                scheduledTotal ?? 0,
                await scheduledJobsQuery.ToListAsync(cancellationToken)
            ),
            new(
                "jobsInProgress",
                "In Progress",
                inProgressCount,
                inProgressTotal ?? 0,
                await inProgressJobsQuery.ToListAsync(cancellationToken)
            ),
            new(
                "jobsCompleted",
                "Completed",
                completedCount,
                completedTotal ?? 0,
                await completedJobsQuery.ToListAsync(cancellationToken)
            ),
            new(
                "invoicesDraft",
                "Invoices (Draft)",
                draftInvoiceCount,
                draftInvoiceTotal ?? 0,
                await draftInvoicesQuery.ToListAsync(cancellationToken)
            ),
            new(
                "invoicesIssued",
                "Invoices Issued",
                issuedInvoiceCount,
                issuedInvoiceTotal ?? 0,
                await issuedInvoicesQuery.ToListAsync(cancellationToken)
            ),
            new(
                "invoicesOverdue",
                "Overdue",
                overdueInvoiceCount,
                overdueInvoiceTotal ?? 0,
                await overdueInvoicesQuery.ToListAsync(cancellationToken)
            ),
            new(
                "invoicesPaid",
                "Paid",
                paidInvoiceCount,
                paidInvoiceTotal ?? 0,
                await paidInvoicesQuery.ToListAsync(cancellationToken)
            ),
        };

        var pipelineTotal = (draftTotal ?? 0)
            + (sentTotal ?? 0)
            + (acceptedTotal ?? 0);

        return new PipelineBoardResponse(columns, pipelineTotal);
    }
}
