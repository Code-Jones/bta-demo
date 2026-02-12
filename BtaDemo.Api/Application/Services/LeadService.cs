using BtaDemo.Api.Data;
using BtaDemo.Api.Domain.Entities;
using BtaDemo.Api.Application.Dtos;

namespace BtaDemo.Api.Application.Services;

public class LeadService
{
    private readonly AppDbContext _dbContext;

    public LeadService(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<Lead> CreateAsync(CreateLeadRequest req, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            throw new ArgumentException("Name is required");

        var lead = new Lead
        {
            Name = req.Name.Trim(),
            Company = req.Company?.Trim(),
            Phone = req.Phone?.Trim(),
            Email = req.Email?.Trim(),
        };

        _dbContext.Leads.Add(lead);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return lead;
    }
    
}