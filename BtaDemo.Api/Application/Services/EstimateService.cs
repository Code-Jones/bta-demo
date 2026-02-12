using BtaDemo.Api.Data;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Application.Dtos;
using Microsoft.EntityFrameworkCore;
using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Application.Services;

public class EstimateService
{
    private readonly AppDbContext _dbContext;

    public EstimateService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<Estimate> CreateAsync(CreateEstimateRequest req, CancellationToken cancellationToken = default)
    {

        var lead = await _dbContext.Leads.FirstOrDefaultAsync(x => x.Id == req.LeadId, cancellationToken) ?? throw new InvalidOperationException("Lead not found");
        
        if (req.Amount <= 0)
            throw new ArgumentException("Amount must be greater than 0");

        var estimate = new Estimate { LeadId = req.LeadId, Amount = req.Amount };
        _dbContext.Estimates.Add(estimate);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return estimate;
    }

    public async Task<Estimate> SendAsync(Guid estimateId, CancellationToken cancellationToken = default)
    {
        var estimate = await _dbContext.Estimates.FirstOrDefaultAsync(x => x.Id == estimateId, cancellationToken) ?? throw new InvalidOperationException("Estimate not found");

        // later add sending email logic here 
        estimate.MarkAsSent(DateTime.UtcNow);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return estimate;
    }

    public async Task<Estimate> AcceptAsync(Guid estimateId, CancellationToken cancellationToken = default)
    {

        // transaction because later we will create a job and invoice
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var estimate = await _dbContext.Estimates.FirstOrDefaultAsync(x => x.Id == estimateId, cancellationToken) ?? throw new InvalidOperationException("Estimate not found");

        // later add job creation logic here 
        estimate.MarkAsAccepted(DateTime.UtcNow);

        var job = new Job
        {
            LeadId = estimate.LeadId,
            EstimateId = estimate.Id,
            Description = estimate.Description,
            ScheduledForUtc = estimate.SentAtUtc ?? DateTime.UtcNow.AddDays(2)
        };

        _dbContext.Jobs.Add(job);

        var invoice = new Invoice
        {
            JobId = job.Id,
            Amount = estimate.Amount,
            Status = InvoiceStatus.Issued,
            IssuedAtUtc = DateTime.UtcNow,
        };

        _dbContext.Invoices.Add(invoice);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return estimate;
    }
    
    public async Task<Estimate> RejectAsync(Guid estimateId, CancellationToken cancellationToken = default)
    {
        var estimate = await _dbContext.Estimates.FirstOrDefaultAsync(x => x.Id == estimateId, cancellationToken) ?? throw new InvalidOperationException("Estimate not found");

        estimate.MarkAsRejected(DateTime.UtcNow);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return estimate;
    }
}