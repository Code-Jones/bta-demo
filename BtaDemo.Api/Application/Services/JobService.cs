using Microsoft.EntityFrameworkCore;
using BtaDemo.Api.Data;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Application.Dtos;
using BtaDemo.Api.Domain.Enum;

namespace BtaDemo.Api.Application.Services;

public class JobService
{
    private readonly AppDbContext _dbContext;
    public JobService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<Job> CreateAsync(CreateJobRequest req, CancellationToken cancellationToken = default)
    {
        var lead = await _dbContext.Leads.AnyAsync(x => x.Id == req.LeadId, cancellationToken);
        if (!lead)
            throw new InvalidOperationException("Lead not found");

        if (req.EstimateId is not null)
        {
            var estExists = await _dbContext.Estimates.AnyAsync(x => x.Id == req.EstimateId, cancellationToken);
            if (!estExists)
                throw new InvalidOperationException("Estimate not found");
        }

        var job = new Job
        {
            LeadId = req.LeadId,
            EstimateId = req.EstimateId,
            Description = req.Description,
            ScheduledForUtc = req.ScheduledForUtc
        };

        _dbContext.Jobs.Add(job);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return job;
    }
}